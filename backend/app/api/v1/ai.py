"""
AI Story Backend - AI API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import StageType
from app.schemas import AIGenerateRequest, AIGenerateResponse, AIStreamMessage
from app.services import ProjectService, AIService

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate", response_model=AIGenerateResponse)
async def generate_content(data: AIGenerateRequest, db: Session = Depends(get_db)):
    """Generate content for a stage using AI."""
    project_service = ProjectService(db)
    ai_service = AIService(db)
    
    # Get project and stage
    project = project_service.get_project(data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    stage = project_service.get_stage(data.project_id, data.stage_type)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Get AI settings
    if data.settings_id:
        settings = ai_service.get_settings(data.settings_id)
    else:
        settings = ai_service.get_default_settings()
    
    if not settings:
        raise HTTPException(
            status_code=400, 
            detail="No AI settings configured. Please add AI settings first."
        )
    
    # Get context from previous stages
    context = project_service.get_stage_context(data.project_id, data.stage_type)
    
    # Store model name before generation (session commit invalidates the object)
    model_name = settings.model

    # Generate content
    try:
        content = await ai_service.generate_content(
            stage=stage,
            context=context,
            settings=settings,
            custom_prompt=data.custom_prompt,
            temperature=data.temperature,
            max_tokens=data.max_tokens,
        )
        
        return AIGenerateResponse(
            content=content,
            model=model_name,
            stage_type=data.stage_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.websocket("/ws/generate")
async def websocket_generate(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for streaming AI generation."""
    await websocket.accept()
    
    project_service = ProjectService(db)
    ai_service = AIService(db)
    
    try:
        # Receive generation request
        data = await websocket.receive_json()
        
        request = AIGenerateRequest(**data)
        
        # Validate
        project = project_service.get_project(request.project_id)
        if not project:
            await websocket.send_json({"type": "error", "error": "Project not found"})
            await websocket.close()
            return
        
        stage = project_service.get_stage(request.project_id, request.stage_type)
        if not stage:
            await websocket.send_json({"type": "error", "error": "Stage not found"})
            await websocket.close()
            return
        
        # Get settings
        if request.settings_id:
            settings = ai_service.get_settings(request.settings_id)
        else:
            settings = ai_service.get_default_settings()
        
        if not settings:
            await websocket.send_json({
                "type": "error", 
                "error": "No AI settings configured"
            })
            await websocket.close()
            return
        
        # Get context
        context = project_service.get_stage_context(request.project_id, request.stage_type)
        
        # Stream generation
        async for token in ai_service.stream_generate(
            stage=stage,
            context=context,
            settings=settings,
            custom_prompt=request.custom_prompt,
        ):
            await websocket.send_json({"type": "token", "content": token})
        
        await websocket.send_json({"type": "done"})
        
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "error": str(e)})
    finally:
        await websocket.close()
