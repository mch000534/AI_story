"""
AI Story Backend - Settings API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db import get_db
from app.models import AISettings
from app.schemas import (
    AISettingsCreate, AISettingsUpdate, AISettingsResponse, 
    AISettingsListResponse, AITestRequest, AITestResponse
)
from app.services import SettingsService
from app.utils.ai_client import create_ai_client

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/ai", response_model=AISettingsListResponse)
def list_ai_settings(db: Session = Depends(get_db)):
    """Get all AI settings."""
    stmt = select(AISettings).where(AISettings.is_active == True)
    result = db.execute(stmt)
    settings_list = result.scalars().all()
    
    return AISettingsListResponse(
        items=[_settings_to_response(s) for s in settings_list],
        total=len(settings_list)
    )


@router.post("/ai", response_model=AISettingsResponse)
def create_ai_settings(data: AISettingsCreate, db: Session = Depends(get_db)):
    """Create new AI settings."""
    service = SettingsService(db)
    settings = service.create_settings(data.model_dump())
    return _settings_to_response(settings)


@router.get("/ai/{settings_id}", response_model=AISettingsResponse)
def get_ai_settings(settings_id: int, db: Session = Depends(get_db)):
    """Get AI settings by ID."""
    stmt = select(AISettings).where(AISettings.id == settings_id)
    result = db.execute(stmt)
    settings = result.scalar_one_or_none()
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    return _settings_to_response(settings)


@router.put("/ai/{settings_id}", response_model=AISettingsResponse)
def update_ai_settings(
    settings_id: int, 
    data: AISettingsUpdate, 
    db: Session = Depends(get_db)
):
    """Update AI settings."""
    service = SettingsService(db)
    settings = service.update_settings(settings_id, data.model_dump(exclude_unset=True))
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    return _settings_to_response(settings)


@router.delete("/ai/{settings_id}")
def delete_ai_settings(settings_id: int, db: Session = Depends(get_db)):
    """Delete AI settings."""
    service = SettingsService(db)
    if not service.delete_settings(settings_id):
        raise HTTPException(status_code=404, detail="Settings not found")
    return {"message": "Settings deleted successfully"}


@router.post("/ai/{settings_id}/test", response_model=AITestResponse)
async def test_ai_connection(settings_id: int, db: Session = Depends(get_db)):
    """Test AI API connection."""
    stmt = select(AISettings).where(AISettings.id == settings_id)
    result = db.execute(stmt)
    settings = result.scalar_one_or_none()
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    try:
        client = create_ai_client(settings)
        success, message = await client.test_connection()
        
        return AITestResponse(
            success=success,
            message=message,
            model=settings.model if success else None
        )
    except Exception as e:
        return AITestResponse(
            success=False,
            message=f"連接錯誤: {str(e)}"
        )


def _settings_to_response(settings: AISettings) -> AISettingsResponse:
    """Convert settings model to response."""
    return AISettingsResponse(
        id=settings.id,
        name=settings.name,
        provider=settings.provider,
        base_url=settings.base_url,
        model=settings.model,
        temperature=settings.temperature,
        top_p=settings.top_p,
        max_tokens=settings.max_tokens,
        is_default=settings.is_default,
        is_active=settings.is_active,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
        has_api_key=bool(settings.api_key_encrypted)
    )
