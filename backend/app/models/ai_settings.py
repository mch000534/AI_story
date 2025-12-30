"""
AI Story Backend - AI Settings Model
"""
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AISettings(Base):
    """AISettings model - represents an AI API configuration."""
    
    __tablename__ = "ai_settings"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # API Configuration
    provider: Mapped[str] = mapped_column(String(50), default="openai")  # openai, claude, custom
    api_key_encrypted: Mapped[str] = mapped_column(Text, default="")
    base_url: Mapped[str] = mapped_column(String(500), default="https://api.openai.com/v1")
    model: Mapped[str] = mapped_column(String(100), default="gpt-4")
    
    # Generation parameters
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    top_p: Mapped[float] = mapped_column(Float, default=1.0)
    max_tokens: Mapped[int] = mapped_column(default=4096)
    
    # Flags
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<AISettings(id={self.id}, name='{self.name}', model='{self.model}')>"
