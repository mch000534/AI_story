"""
AI Story Backend - Stage Version Model
"""
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from .stage import Stage


class StageVersion(Base):
    """StageVersion model - represents a saved version of a stage's content."""
    
    __tablename__ = "stage_versions"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    stage_id: Mapped[int] = mapped_column(
        ForeignKey("stages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    version_number: Mapped[int] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Source info
    source: Mapped[str] = mapped_column(
        String(20), default="manual"  # "manual" or "ai"
    )
    ai_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ai_params: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    
    # Relationships
    stage: Mapped["Stage"] = relationship("Stage", back_populates="versions")
    
    def __repr__(self) -> str:
        return f"<StageVersion(id={self.id}, stage_id={self.stage_id}, v{self.version_number})>"
