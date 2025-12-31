"""
AI Story Backend - System Prompt Model
"""
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import StageType


class SystemPrompt(Base):
    """SystemPrompt model - represents a system prompt for a specific stage."""
    
    __tablename__ = "system_prompts"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    stage: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<SystemPrompt(stage='{self.stage}')>"
