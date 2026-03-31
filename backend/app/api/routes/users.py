from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
import bcrypt
import re

from app.db.database import get_db
from app.db.models import User
from app.utils.validators import (
    validate_email,
    validate_designation,
    validate_skill_level,
    validate_interests,
)
from app.utils.response_formatter import success_response, error_response

router = APIRouter()


# ── Password Utilities ────────────────────────────────────────────────────────

def _validate_password(password: str) -> str:
    """
    Enforce password strength rules before hashing.
    Raises ValueError with a user-friendly message if invalid.
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number.")
    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError("Password must contain at least one special character.")
    return password


def _hash_password(plain: str) -> str:
    """
    Hash a plaintext password with bcrypt (12 rounds).
    bcrypt auto-generates a unique salt per hash, so two identical
    passwords will produce different hashes — immune to rainbow tables.
    """
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def _verify_password(plain: str, hashed: str) -> bool:
    """
    Constant-time comparison of a plaintext password against a bcrypt hash.
    Never compare hashes directly — use this function.
    """
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: str
    designation: str
    skill_level: str
    interests: List[str]
    password: str = Field(..., min_length=8)   # plaintext — hashed immediately, never stored raw


class UserLogin(BaseModel):
    email: str
    password: str   # plaintext — verified against bcrypt hash, never stored


class UserUpdate(BaseModel):
    designation: Optional[str] = None
    skill_level: Optional[str] = None
    interests: Optional[List[str]] = None


def _serialize_user(user: User) -> dict:
    """Convert a User ORM object to a JSON-serializable dict. Never exposes password_hash."""
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "designation": user.designation,
        "skill_level": user.skill_level,
        "interests": user.interests or [],
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/create")
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user profile.
    Password is validated for strength, then bcrypt-hashed before storage.
    The plaintext password is never persisted anywhere.
    """
    try:
        email       = validate_email(payload.email)
        designation = validate_designation(payload.designation)
        skill_level = validate_skill_level(payload.skill_level)
        interests   = validate_interests(payload.interests)
        _validate_password(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Duplicate email check
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail=f"Email '{email}' is already registered")

    user = User(
        id            = uuid.uuid4(),
        name          = payload.name.strip(),
        email         = email,
        password_hash = _hash_password(payload.password),  # bcrypt — salted, irreversible
        designation   = designation,
        skill_level   = skill_level,
        interests     = interests,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return success_response(_serialize_user(user), "User created successfully")


@router.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user by email + password.

    Security notes:
    - Always queries by email first, then verifies password with bcrypt.
    - Returns the same generic error for wrong email OR wrong password
      to prevent user enumeration attacks (attacker cannot tell which was wrong).
    - bcrypt.checkpw uses constant-time comparison — immune to timing attacks.
    """
    _GENERIC_ERROR = "Invalid email or password."

    user = db.query(User).filter(User.email == payload.email.strip().lower()).first()

    # Guard: user not found OR no password set (e.g. legacy account)
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail=_GENERIC_ERROR)

    # Guard: wrong password — constant-time bcrypt check
    if not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail=_GENERIC_ERROR)

    return success_response(_serialize_user(user), "Login successful")


@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Fetch a user profile by UUID."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format")

    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return success_response(_serialize_user(user), "User fetched successfully")


@router.put("/{user_id}")
def update_user(user_id: str, payload: UserUpdate, db: Session = Depends(get_db)):
    """Update a user's designation, skill_level, and/or interests."""
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format")

    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        if payload.designation is not None:
            user.designation = validate_designation(payload.designation)
        if payload.skill_level is not None:
            user.skill_level = validate_skill_level(payload.skill_level)
        if payload.interests is not None:
            user.interests = validate_interests(payload.interests)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    db.commit()
    db.refresh(user)

    return success_response(_serialize_user(user), "User updated successfully")


# ── Change Password ───────────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


@router.put("/{user_id}/password")
def change_password(user_id: str, payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    """
    Change a user's password. Requires the current password for verification.
    """
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid UUID format")

    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.password_hash:
        raise HTTPException(status_code=400, detail="No password set for this account")

    # Verify current password
    if not _verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # Validate new password strength
    try:
        _validate_password(payload.new_password)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Hash and save
    user.password_hash = _hash_password(payload.new_password)
    db.commit()

    return success_response({"id": str(user.id)}, "Password changed successfully")