"""
AI Story Backend - Settings API Routes
"""
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
from typing import List

from app.db import get_db
from app.models import AISettings
from app.schemas import (
    AISettingsCreate, AISettingsUpdate, AISettingsResponse, 
    AISettingsListResponse, AITestRequest, AITestResponse
)
from app.services import SettingsService
from app.utils.ai_client import create_ai_client

router = APIRouter(prefix="/settings", tags=["Settings"])


class FetchModelsRequest(BaseModel):
    api_key: str
    base_url: str


class ModelInfo(BaseModel):
    id: str
    name: str


class FetchModelsResponse(BaseModel):
    models: List[ModelInfo]


@router.post("/ai/models", response_model=FetchModelsResponse)
async def fetch_available_models(data: FetchModelsRequest):
    """Fetch available models from the given base URL."""
    try:
        # Call the /models endpoint (OpenAI-compatible API)
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{data.base_url.rstrip('/')}/models",
                headers={"Authorization": f"Bearer {data.api_key}"}
            )
            response.raise_for_status()
            result = response.json()
            
            models = []
            # OpenAI format: {"data": [{"id": "model-id", ...}, ...]}
            if "data" in result:
                for model in result["data"]:
                    model_id = model.get("id", "")
                    models.append(ModelInfo(
                        id=model_id,
                        name=model.get("name", model_id)
                    ))
            # Some APIs return {"models": [...]}
            elif "models" in result:
                for model in result["models"]:
                    if isinstance(model, str):
                        models.append(ModelInfo(id=model, name=model))
                    else:
                        model_id = model.get("id", model.get("name", ""))
                        models.append(ModelInfo(
                            id=model_id,
                            name=model.get("name", model_id)
                        ))
            
            # Sort by id
            models.sort(key=lambda m: m.id)
            return FetchModelsResponse(models=models)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"API 錯誤: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取模型列表失敗: {str(e)}")


@router.get("/ai/{settings_id}/key")
def get_api_key(settings_id: int, db: Session = Depends(get_db)):
    """Get decrypted API key for editing purposes."""
    from app.core.security import decrypt_api_key
    
    stmt = select(AISettings).where(AISettings.id == settings_id)
    result = db.execute(stmt)
    settings = result.scalar_one_or_none()
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    api_key = decrypt_api_key(settings.api_key_encrypted)
    return {"api_key": api_key}


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
