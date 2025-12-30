"""
AI Story Backend - Stage Model
"""
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from .enums import StageType, StageStatus

if TYPE_CHECKING:
    from .project import Project
    from .stage_version import StageVersion


class Stage(Base):
    """Stage model - represents one of the 8 creation stages."""
    
    __tablename__ = "stages"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    stage_type: Mapped[StageType] = mapped_column(
        SQLEnum(StageType), nullable=False, index=True
    )
    status: Mapped[StageStatus] = mapped_column(
        SQLEnum(StageStatus), default=StageStatus.LOCKED
    )
    
    # Content
    content: Mapped[str] = mapped_column(Text, default="")
    
    # AI generation metadata
    last_ai_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_ai_params: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="stages")
    versions: Mapped[List["StageVersion"]] = relationship(
        "StageVersion", back_populates="stage", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Stage(id={self.id}, type={self.stage_type.value}, status={self.status.value})>"
