"""
AI Story Backend - System Prompt API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db import get_db
from app.models import SystemPrompt
from app.models.enums import StageType, STAGE_NAMES
from app.schemas.system_prompt import (
    SystemPromptCreate, 
    SystemPromptUpdate, 
    SystemPromptResponse
)
from app.services.prompt_service import STAGE_PROMPTS

router = APIRouter(prefix="/prompts", tags=["Prompts"])


@router.get("/", response_model=list[SystemPromptResponse])
def list_prompts(db: Session = Depends(get_db)):
    """List all system prompts. Initialize if empty."""
    stmt = select(SystemPrompt)
    prompts = db.execute(stmt).scalars().all()
    
    # Initialize if empty
    if not prompts:
        initial_prompts = []
        for stage, content in STAGE_PROMPTS.items():
            db_prompt = SystemPrompt(stage=stage.value, content=content)
            db.add(db_prompt)
            initial_prompts.append(db_prompt)
        db.commit()
        for p in initial_prompts:
            db.refresh(p)
        return initial_prompts
        
    return prompts


@router.get("/{stage}", response_model=SystemPromptResponse)
def get_prompt(stage: StageType, db: Session = Depends(get_db)):
    """Get system prompt for a stage."""
    stmt = select(SystemPrompt).where(SystemPrompt.stage == stage.value)
    prompt = db.execute(stmt).scalar_one_or_none()
    
    if not prompt:
        # If not found but exists in defaults, create it
        if stage in STAGE_PROMPTS:
            prompt = SystemPrompt(stage=stage.value, content=STAGE_PROMPTS[stage])
            db.add(prompt)
            db.commit()
            db.refresh(prompt)
        else:
            raise HTTPException(status_code=404, detail="Prompt not found")
            
    return prompt


@router.put("/{stage}", response_model=SystemPromptResponse)
def update_prompt(
    stage: StageType, 
    data: SystemPromptUpdate, 
    db: Session = Depends(get_db)
):
    """Update system prompt for a stage."""
    stmt = select(SystemPrompt).where(SystemPrompt.stage == stage.value)
    prompt = db.execute(stmt).scalar_one_or_none()
    
    if prompt:
        prompt.content = data.content
    else:
        prompt = SystemPrompt(stage=stage.value, content=data.content)
        db.add(prompt)
    
    db.commit()
    db.refresh(prompt)
    return prompt


@router.post("/{stage}/reset", response_model=SystemPromptResponse)
def reset_prompt(stage: StageType, db: Session = Depends(get_db)):
    """Reset system prompt to default."""
    if stage not in STAGE_PROMPTS:
        raise HTTPException(status_code=400, detail="No default prompt for this stage")
        
    stmt = select(SystemPrompt).where(SystemPrompt.stage == stage.value)
    prompt = db.execute(stmt).scalar_one_or_none()
    
    default_content = STAGE_PROMPTS[stage]
    
    if prompt:
        prompt.content = default_content
    else:
        prompt = SystemPrompt(stage=stage.value, content=default_content)
        db.add(prompt)
        
    db.commit()
    db.refresh(prompt)
    return prompt
