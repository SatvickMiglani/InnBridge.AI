from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=True)   # bcrypt hash — never store plaintext
    designation = Column(String)
    skill_level = Column(String)
    interests = Column(ARRAY(String))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    saved_papers = relationship("SavedPaper", back_populates="user")
    enrolled_projects = relationship("EnrolledProject", back_populates="user", order_by="EnrolledProject.enrolled_at.desc()")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    arxiv_id = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    authors = Column(ARRAY(String))
    abstract = Column(Text)
    source_url = Column(String)
    published_date = Column(DateTime)
    field = Column(String)
    difficulty_score = Column(Float)

    summary_one_min = Column(Text)
    summary_five_min = Column(Text)
    summary_deep = Column(Text)
    build_ideas = Column(Text)
    suggested_stack = Column(ARRAY(String))
    estimated_build_time = Column(String)

    embedding_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    saved_by = relationship("SavedPaper", back_populates="paper")


class SavedPaper(Base):
    __tablename__ = "saved_papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    paper_id = Column(UUID(as_uuid=True), ForeignKey("papers.id"))
    saved_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_papers")
    paper = relationship("Paper", back_populates="saved_by")


class EnrolledProject(Base):
    __tablename__ = "enrolled_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    project_data = Column(JSONB, nullable=False)  # full project snapshot
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="enrolled_projects")