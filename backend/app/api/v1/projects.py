"""
AI Story Backend - Projects API Routes
"""
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import StageType, StageStatus, Stage, StageVersion
from app.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse,
    StageUpdate, StageResponse, StageVersionResponse, StageVersionListResponse,
    RestoreVersionRequest,
)
from app.services import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    service = ProjectService(db)
    project = service.create_project(data)
    return _project_to_response(project)


@router.get("", response_model=ProjectListResponse)
def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all projects with pagination."""
    service = ProjectService(db)
    projects, total = service.list_projects(page, page_size, search)
    
    total_pages = (total + page_size - 1) // page_size
    
    return ProjectListResponse(
        items=[_project_to_response(p) for p in projects],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a project by ID."""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_response(project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project."""
    service = ProjectService(db)
    project = service.update_project(project_id, data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_response(project)


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project (soft delete)."""
    service = ProjectService(db)
    if not service.delete_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}


# Stage routes
@router.get("/{project_id}/stages/{stage_type}", response_model=StageResponse)
def get_stage(project_id: int, stage_type: StageType, db: Session = Depends(get_db)):
    """Get a specific stage."""
    service = ProjectService(db)
    stage = service.get_stage(project_id, stage_type)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return _stage_to_response(stage)


@router.put("/{project_id}/stages/{stage_type}", response_model=StageResponse)
def update_stage(
    project_id: int, 
    stage_type: StageType, 
    data: StageUpdate,
    db: Session = Depends(get_db)
):
    """Update stage content."""
    service = ProjectService(db)
    stage = service.get_stage(project_id, stage_type)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Save version if content changed
    if stage.content != data.content:
        _save_manual_version(db, stage, data.content)
    
    stage.content = data.content
    if data.status:
        stage.status = data.status
    elif not stage.content:
        stage.status = StageStatus.UNLOCKED
    else:
        stage.status = StageStatus.IN_PROGRESS
    
    db.commit()
    db.refresh(stage)
    return _stage_to_response(stage)


@router.get("/{project_id}/stages/{stage_type}/versions", response_model=StageVersionListResponse)
def get_stage_versions(
    project_id: int, 
    stage_type: StageType,
    db: Session = Depends(get_db)
):
    """Get version history for a stage."""
    service = ProjectService(db)
    stage = service.get_stage(project_id, stage_type)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    versions = sorted(stage.versions, key=lambda v: v.version_number, reverse=True)
    
    return StageVersionListResponse(
        items=[_version_to_response(v) for v in versions],
        total=len(versions)
    )


@router.post("/{project_id}/stages/{stage_type}/restore", response_model=StageResponse)
def restore_version(
    project_id: int,
    stage_type: StageType,
    data: RestoreVersionRequest,
    db: Session = Depends(get_db)
):
    """Restore a stage to a previous version."""
    service = ProjectService(db)
    stage = service.get_stage(project_id, stage_type)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Find version
    version = None
    for v in stage.versions:
        if v.id == data.version_id:
            version = v
            break
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Save current as new version before restore
    _save_manual_version(db, stage, stage.content, "restore")
    
    # Restore content
    stage.content = version.content
    db.commit()
    db.refresh(stage)
    
    return _stage_to_response(stage)


@router.put("/{project_id}/stages/{stage_type}/versions/{version_id}")
def rename_version(
    project_id: int,
    stage_type: StageType,
    version_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    """Rename a version with a custom label."""
    service = ProjectService(db)
    stage = service.get_stage(project_id, stage_type)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Find version
    version = db.query(StageVersion).filter(
        StageVersion.id == version_id,
        StageVersion.stage_id == stage.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Update label
    version.label = data.get("label", "")
    db.commit()
    
    return {"message": "Version renamed successfully", "label": version.label}


@router.delete("/{project_id}/stages/{stage_type}/versions/{version_id}")
def delete_version(
    project_id: int,
    stage_type: StageType,
    version_id: int,
    db: Session = Depends(get_db)
):
    """Delete a version."""
    service = ProjectService(db)
    stage = service.get_stage(project_id, stage_type)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Find version
    version = db.query(StageVersion).filter(
        StageVersion.id == version_id,
        StageVersion.stage_id == stage.id
    ).first()
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    db.delete(version)
    db.commit()
    
    return {"message": "Version deleted successfully"}


def _project_to_response(project) -> ProjectResponse:
    """Convert project model to response."""
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        category=project.category,
        tags=json.loads(project.tags) if project.tags else [],
        created_at=project.created_at,
        updated_at=project.updated_at,
        is_deleted=project.is_deleted
    )


def _stage_to_response(stage: Stage) -> StageResponse:
    """Convert stage model to response."""
    return StageResponse(
        id=stage.id,
        project_id=stage.project_id,
        stage_type=stage.stage_type,
        status=stage.status,
        content=stage.content,
        last_ai_model=stage.last_ai_model,
        last_ai_params=json.loads(stage.last_ai_params) if stage.last_ai_params else None,
        created_at=stage.created_at,
        updated_at=stage.updated_at
    )


def _version_to_response(version: StageVersion) -> StageVersionResponse:
    """Convert version model to response."""
    return StageVersionResponse(
        id=version.id,
        stage_id=version.stage_id,
        version_number=version.version_number,
        content=version.content,
        source=version.source,
        ai_model=version.ai_model,
        ai_params=json.loads(version.ai_params) if version.ai_params else None,
        label=version.label,
        created_at=version.created_at
    )


def _save_manual_version(db: Session, stage: Stage, content: str, source: str = "manual"):
    """Save a manual version."""
    from sqlalchemy import select, func
    
    # Get max version number
    stmt = select(func.max(StageVersion.version_number)).where(StageVersion.stage_id == stage.id)
    result = db.execute(stmt)
    max_version = result.scalar() or 0
    
    version = StageVersion(
        stage_id=stage.id,
        version_number=max_version + 1,
        content=content,
        source=source
    )
    db.add(version)
