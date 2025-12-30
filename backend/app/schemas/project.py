"""
AI Story Backend - Project Schemas
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base schema for Project."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=5000)
    category: str = Field(default="", max_length=50)
    tags: List[str] = Field(default_factory=list)


class ProjectCreate(ProjectBase):
    """Schema for creating a project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None


class ProjectResponse(ProjectBase):
    """Schema for project response."""
    id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
    
    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Schema for paginated project list."""
    items: List[ProjectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
