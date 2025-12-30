"""
AI Story Backend - AI Schemas
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from app.models.enums import StageType


class AIGenerateRequest(BaseModel):
    """Schema for AI generation request."""
    project_id: int
    stage_type: StageType
    settings_id: Optional[int] = None  # Use default if not provided
    custom_prompt: Optional[str] = None  # Allow custom prompt override
    
    # Optional parameter overrides
    temperature: Optional[float] = Field(None, ge=0, le=2)
    max_tokens: Optional[int] = Field(None, ge=100, le=16000)


class AIGenerateResponse(BaseModel):
    """Schema for AI generation response."""
    content: str
    model: str
    tokens_used: Optional[int] = None
    stage_type: StageType


class AIStreamMessage(BaseModel):
    """Schema for streaming message."""
    type: str  # "token", "done", "error"
    content: Optional[str] = None
    error: Optional[str] = None


class AITestRequest(BaseModel):
    """Schema for testing AI connection."""
    settings_id: int


class AITestResponse(BaseModel):
    """Schema for AI test response."""
    success: bool
    message: str
    model: Optional[str] = None
