"""
AI Story Backend - System Prompt Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.enums import StageType


class SystemPromptBase(BaseModel):
    """Base schema for SystemPrompt."""
    stage: StageType
    content: str


class SystemPromptCreate(SystemPromptBase):
    """Schema for creating a SystemPrompt."""
    pass


class SystemPromptUpdate(BaseModel):
    """Schema for updating a SystemPrompt."""
    content: str


class SystemPromptResponse(SystemPromptBase):
    """Schema for SystemPrompt response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
