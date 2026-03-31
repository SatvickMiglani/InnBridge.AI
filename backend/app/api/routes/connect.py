from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Any
import uuid

from app.db.database import get_db
from app.db.models import EnrolledProject, User
from app.utils.response_formatter import success_response

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────

class EnrollRequest(BaseModel):
    user_id: str
    title: str
    project_data: dict[str, Any]  # full project snapshot


# ─── POST /projects/enroll ───────────────────────────────

@router.post("/enroll")
def enroll_in_project(payload: EnrollRequest, db: Session = Depends(get_db)):
    """Save a project blueprint to the user's profile for future reference."""

    try:
        user_uuid = uuid.UUID(payload.user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent duplicate enrollment by title for same user
    existing = db.query(EnrolledProject).filter(
        EnrolledProject.user_id == user_uuid,
        EnrolledProject.title == payload.title.strip()
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Already enrolled in this project")

    enrollment = EnrolledProject(
        user_id=user_uuid,
        title=payload.title.strip(),
        project_data=payload.project_data,
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return success_response({
        "enrollment_id": str(enrollment.id),
        "title": enrollment.title,
        "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
    }, "Enrolled successfully")


# ─── GET /projects/enrolled/{user_id} ────────────────────

@router.get("/enrolled/{user_id}")
def get_enrolled_projects(user_id: str, db: Session = Depends(get_db)):
    """Get all projects a user has enrolled in, newest first."""

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    enrollments = (
        db.query(EnrolledProject)
        .filter(EnrolledProject.user_id == user_uuid)
        .order_by(EnrolledProject.enrolled_at.desc())
        .all()
    )

    projects = [
        {
            "enrollment_id": str(e.id),
            "title": e.title,
            "project_data": e.project_data,
            "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
        }
        for e in enrollments
    ]

    return success_response({
        "user_id": user_id,
        "total": len(projects),
        "projects": projects,
    })


@router.get("/enrolled/detail/{enrollment_id}")
def get_enrolled_project_detail(enrollment_id: str, db: Session = Depends(get_db)):
    """Fetch details for a single enrolled project by its enrollment ID."""
    
    try:
        enroll_uuid = uuid.UUID(enrollment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid enrollment_id format")

    enrollment = db.query(EnrolledProject).filter(EnrolledProject.id == enroll_uuid).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    return success_response({
        "enrollment_id": str(enrollment.id),
        "title": enrollment.title,
        "project_data": enrollment.project_data,
        "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
    })


# ─── DELETE /projects/enrolled/{enrollment_id} ───────────

@router.delete("/enrolled/{enrollment_id}")
def unenroll_project(enrollment_id: str, db: Session = Depends(get_db)):
    """Remove a project from the user's enrolled list."""

    try:
        enroll_uuid = uuid.UUID(enrollment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid enrollment_id format")

    enrollment = db.query(EnrolledProject).filter(EnrolledProject.id == enroll_uuid).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    db.delete(enrollment)
    db.commit()

    return success_response({"enrollment_id": enrollment_id}, "Unenrolled successfully")