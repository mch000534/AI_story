"""
AI Story Backend - Project Service
"""
import json
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func

from app.models import Project, Stage, StageType, StageStatus, STAGE_ORDER
from app.schemas import ProjectCreate, ProjectUpdate


class ProjectService:
    """Service for managing projects."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_project(self, data: ProjectCreate) -> Project:
        """Create a new project with all 8 stages initialized."""
        # Create project
        project = Project(
            name=data.name,
            description=data.description,
            category=data.category,
            tags=json.dumps(data.tags) if data.tags else "[]"
        )
        self.db.add(project)
        self.db.flush()  # Get project.id
        
        # Create all 8 stages
        for i, stage_type in enumerate(STAGE_ORDER):
            stage = Stage(
                project_id=project.id,
                stage_type=stage_type,
                # First stage is unlocked, others are locked
                status=StageStatus.UNLOCKED if i == 0 else StageStatus.LOCKED,
                content=""
            )
            self.db.add(stage)
        
        self.db.commit()
        self.db.refresh(project)
        return project
    
    def get_project(self, project_id: int) -> Optional[Project]:
        """Get a project by ID with stages loaded."""
        stmt = (
            select(Project)
            .options(joinedload(Project.stages))
            .where(Project.id == project_id)
            .where(Project.is_deleted == False)
        )
        result = self.db.execute(stmt)
        return result.unique().scalar_one_or_none()
    
    def list_projects(
        self, 
        page: int = 1, 
        page_size: int = 20,
        search: Optional[str] = None
    ) -> Tuple[List[Project], int]:
        """List projects with pagination."""
        query = select(Project).where(Project.is_deleted == False)
        
        if search:
            query = query.where(
                Project.name.ilike(f"%{search}%") |
                Project.description.ilike(f"%{search}%")
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = self.db.execute(count_query).scalar() or 0
        
        # Apply pagination
        query = query.order_by(Project.updated_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        result = self.db.execute(query)
        projects = list(result.scalars().all())
        
        return projects, total
    
    def update_project(self, project_id: int, data: ProjectUpdate) -> Optional[Project]:
        """Update a project."""
        project = self.get_project(project_id)
        if not project:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        if "tags" in update_data:
            update_data["tags"] = json.dumps(update_data["tags"])
        
        for key, value in update_data.items():
            setattr(project, key, value)
        
        self.db.commit()
        self.db.refresh(project)
        return project
    
    def delete_project(self, project_id: int) -> bool:
        """Soft delete a project."""
        project = self.get_project(project_id)
        if not project:
            return False
        
        project.is_deleted = True
        project.deleted_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def get_stage(self, project_id: int, stage_type: StageType) -> Optional[Stage]:
        """Get a specific stage by project ID and stage type."""
        stmt = (
            select(Stage)
            .where(Stage.project_id == project_id)
            .where(Stage.stage_type == stage_type)
        )
        result = self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    def get_stage_context(self, project_id: int, stage_type: StageType) -> dict:
        """Get context from previous stages for AI generation."""
        project = self.get_project(project_id)
        if not project:
            return {}
        
        context = {"project_name": project.name}
        
        for stage in project.stages:
            if stage.content:
                context[stage.stage_type.value] = stage.content
        
        return context
