"""
AI Story Backend - AI Service
"""
import json
from typing import Optional, AsyncGenerator
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import AISettings, Stage, StageVersion, StageStatus, StageType
from app.utils.ai_client import create_ai_client
from app.services.prompt_service import PromptService
from app.core.security import encrypt_api_key


class AIService:
    """Service for AI generation."""
    
    def __init__(self, db: Session):
        self.db = db
        self.prompt_service = PromptService()
    
    def get_default_settings(self) -> Optional[AISettings]:
        """Get the default AI settings."""
        stmt = (
            select(AISettings)
            .where(AISettings.is_default == True)
            .where(AISettings.is_active == True)
        )
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            # Get any active settings
            stmt = select(AISettings).where(AISettings.is_active == True).limit(1)
            result = self.db.execute(stmt)
            settings = result.scalar_one_or_none()
        
        return settings
    
    def get_settings(self, settings_id: int) -> Optional[AISettings]:
        """Get AI settings by ID."""
        stmt = select(AISettings).where(AISettings.id == settings_id)
        result = self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def generate_content(
        self,
        stage: Stage,
        context: dict,
        settings: AISettings,
        custom_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate content for a stage."""
        # Build prompt
        prompt = self.prompt_service.build_prompt(
            stage.stage_type,
            context,
            custom_prompt
        )
        
        # Create client and generate
        client = create_ai_client(settings)
        
        kwargs = {}
        if temperature is not None:
            kwargs["temperature"] = temperature
        if max_tokens is not None:
            kwargs["max_tokens"] = max_tokens
        
        content = await client.generate(prompt, **kwargs)
        
        # Save version
        self._save_version(stage, content, settings)
        
        # Update stage
        stage.content = content
        stage.status = StageStatus.IN_PROGRESS
        stage.last_ai_model = settings.model
        stage.last_ai_params = json.dumps({
            "temperature": temperature or settings.temperature,
            "max_tokens": max_tokens or settings.max_tokens
        })
        
        # Unlock next stage
        self._unlock_next_stage(stage)
        
        self.db.commit()
        
        return content
    
    async def stream_generate(
        self,
        stage: Stage,
        context: dict,
        settings: AISettings,
        custom_prompt: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Generate content with streaming."""
        # Build prompt
        prompt = self.prompt_service.build_prompt(
            stage.stage_type,
            context,
            custom_prompt
        )
        
        # Create client and stream
        client = create_ai_client(settings)
        
        full_content = ""
        async for token in client.stream_generate(prompt):
            full_content += token
            yield token
        
        # Save after streaming completes
        self._save_version(stage, full_content, settings)
        stage.content = full_content
        stage.status = StageStatus.IN_PROGRESS
        stage.last_ai_model = settings.model
        
        self._unlock_next_stage(stage)
        self.db.commit()
    
    def _save_version(self, stage: Stage, content: str, settings: AISettings):
        """Save a new version of the stage content."""
        # Get next version number
        stmt = (
            select(StageVersion)
            .where(StageVersion.stage_id == stage.id)
            .order_by(StageVersion.version_number.desc())
            .limit(1)
        )
        result = self.db.execute(stmt)
        last_version = result.scalar_one_or_none()
        next_version = (last_version.version_number + 1) if last_version else 1
        
        version = StageVersion(
            stage_id=stage.id,
            version_number=next_version,
            content=content,
            source="ai",
            ai_model=settings.model,
            ai_params=json.dumps({
                "temperature": settings.temperature,
                "max_tokens": settings.max_tokens
            })
        )
        self.db.add(version)
    
    def _unlock_next_stage(self, stage: Stage):
        """Unlock the next stage if current stage has content."""
        from app.models.enums import STAGE_ORDER
        
        try:
            current_index = STAGE_ORDER.index(stage.stage_type)
            if current_index < len(STAGE_ORDER) - 1:
                next_type = STAGE_ORDER[current_index + 1]
                # Find next stage
                stmt = (
                    select(Stage)
                    .where(Stage.project_id == stage.project_id)
                    .where(Stage.stage_type == next_type)
                )
                result = self.db.execute(stmt)
                next_stage = result.scalar_one_or_none()
                if next_stage and next_stage.status == StageStatus.LOCKED:
                    next_stage.status = StageStatus.UNLOCKED
        except ValueError:
            pass


class SettingsService:
    """Service for managing AI settings."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_settings(self, data: dict) -> AISettings:
        """Create new AI settings."""
        api_key = data.pop("api_key", "")
        settings = AISettings(
            **data,
            api_key_encrypted=encrypt_api_key(api_key)
        )
        
        # If this is default, unset other defaults
        if settings.is_default:
            self._unset_other_defaults()
        
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings
    
    def update_settings(self, settings_id: int, data: dict) -> Optional[AISettings]:
        """Update AI settings."""
        stmt = select(AISettings).where(AISettings.id == settings_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            return None
        
        # Handle API key separately
        if "api_key" in data and data["api_key"]:
            settings.api_key_encrypted = encrypt_api_key(data.pop("api_key"))
        elif "api_key" in data:
            data.pop("api_key")
        
        for key, value in data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        if settings.is_default:
            self._unset_other_defaults(settings.id)
        
        self.db.commit()
        self.db.refresh(settings)
        return settings
    
    def delete_settings(self, settings_id: int) -> bool:
        """Delete AI settings."""
        stmt = select(AISettings).where(AISettings.id == settings_id)
        result = self.db.execute(stmt)
        settings = result.scalar_one_or_none()
        
        if not settings:
            return False
        
        self.db.delete(settings)
        self.db.commit()
        return True
    
    def _unset_other_defaults(self, exclude_id: Optional[int] = None):
        """Unset other default settings."""
        stmt = select(AISettings).where(AISettings.is_default == True)
        if exclude_id:
            stmt = stmt.where(AISettings.id != exclude_id)
        result = self.db.execute(stmt)
        for s in result.scalars():
            s.is_default = False
