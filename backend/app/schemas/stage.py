"""
AI Story Backend - Stage Schemas
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.models.enums import StageType, StageStatus


class StageBase(BaseModel):
    """Base schema for Stage."""
    stage_type: StageType
    status: StageStatus = StageStatus.LOCKED


class StageUpdate(BaseModel):
    """Schema for updating stage content."""
    content: str = Field(..., max_length=100000)
    status: Optional[StageStatus] = None


class StageResponse(BaseModel):
    """Schema for stage response."""
    id: int
    project_id: int
    stage_type: StageType
    status: StageStatus
    content: str
    last_ai_model: Optional[str] = None
    last_ai_params: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class StageVersionResponse(BaseModel):
    """Schema for stage version response."""
    id: int
    stage_id: int
    version_number: int
    content: str
    source: str
    ai_model: Optional[str] = None
    ai_params: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class StageVersionListResponse(BaseModel):
    """Schema for list of stage versions."""
    items: List[StageVersionResponse]
    total: int


class RestoreVersionRequest(BaseModel):
    """Schema for restoring a version."""
    version_id: int
