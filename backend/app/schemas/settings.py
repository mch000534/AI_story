"""
AI Story Backend - Settings Schemas
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class AISettingsBase(BaseModel):
    """Base schema for AI settings."""
    name: str = Field(..., min_length=1, max_length=100)
    provider: str = Field(default="openai", max_length=50)
    base_url: str = Field(default="https://api.openai.com/v1", max_length=500)
    model: str = Field(default="gpt-4", max_length=100)
    temperature: float = Field(default=0.7, ge=0, le=2)
    top_p: float = Field(default=1.0, ge=0, le=1)
    max_tokens: int = Field(default=4096, ge=100, le=16000)
    is_default: bool = False


class AISettingsCreate(AISettingsBase):
    """Schema for creating AI settings."""
    api_key: str = Field(..., min_length=1)  # Plain text, will be encrypted


class AISettingsUpdate(BaseModel):
    """Schema for updating AI settings."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    provider: Optional[str] = Field(None, max_length=50)
    api_key: Optional[str] = None  # Only update if provided
    base_url: Optional[str] = Field(None, max_length=500)
    model: Optional[str] = Field(None, max_length=100)
    temperature: Optional[float] = Field(None, ge=0, le=2)
    top_p: Optional[float] = Field(None, ge=0, le=1)
    max_tokens: Optional[int] = Field(None, ge=100, le=16000)
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class AISettingsResponse(BaseModel):
    """Schema for AI settings response (without API key)."""
    id: int
    name: str
    provider: str
    base_url: str
    model: str
    temperature: float
    top_p: float
    max_tokens: int
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    has_api_key: bool = True  # Indicates if API key is set
    
    class Config:
        from_attributes = True


class AISettingsListResponse(BaseModel):
    """Schema for list of AI settings."""
    items: List[AISettingsResponse]
    total: int
