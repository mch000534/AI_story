"""
AI Story Backend - Export API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import StageType
from app.services import ProjectService
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["Export"])


from urllib.parse import quote

@router.post("/script/{project_id}")
async def export_script(
    project_id: int,
    format: str = "pdf",
    db: Session = Depends(get_db)
):
    """Export script as PDF or Word document."""
    try:
        project_service = ProjectService(db)
        export_service = ExportService()
        
        project = project_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        stages = list(project.stages)
        quoted_name = quote(project.name)
        
        if format == "pdf":
            content = export_service.export_script_pdf(project, stages)
            return Response(
                content=content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename*=utf-8''{quoted_name}_script.pdf"}
            )
        elif format == "docx":
            content = export_service.export_script_docx(project, stages)
            return Response(
                content=content,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f"attachment; filename*=utf-8''{quoted_name}_script.docx"}
            )
        elif format == "fountain":
            script_stage = next((s for s in stages if s.stage_type == StageType.SCRIPT), None)
            content = export_service.export_fountain(project, script_stage)
            return Response(
                content=content.encode('utf-8'),
                media_type="text/plain",
                headers={"Content-Disposition": f"attachment; filename*=utf-8''{quoted_name}.fountain"}
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post("/storyboard/{project_id}")
async def export_storyboard(project_id: int, db: Session = Depends(get_db)):
    """Export storyboard as Excel spreadsheet."""
    project_service = ProjectService(db)
    export_service = ExportService()
    
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    storyboard_stage = next(
        (s for s in project.stages if s.stage_type == StageType.STORYBOARD),
        None
    )
    
    content = export_service.export_storyboard_excel(project, storyboard_stage)
    quoted_name = quote(project.name)
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename*=utf-8''{quoted_name}_storyboard.xlsx"}
    )


@router.post("/prompts/{project_id}")
async def export_prompts(project_id: int, db: Session = Depends(get_db)):
    """Export AI prompts as text file."""
    project_service = ProjectService(db)
    export_service = ExportService()
    
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    image_stage = next(
        (s for s in project.stages if s.stage_type == StageType.IMAGE_PROMPT),
        None
    )
    motion_stage = next(
        (s for s in project.stages if s.stage_type == StageType.MOTION_PROMPT),
        None
    )
    
    content = export_service.export_prompts_txt(project, image_stage, motion_stage)
    quoted_name = quote(project.name)
    return Response(
        content=content.encode('utf-8'),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename*=utf-8''{quoted_name}_prompts.txt"}
    )


@router.post("/complete/{project_id}")
async def export_complete(project_id: int, db: Session = Depends(get_db)):
    """Export complete project as ZIP archive."""
    project_service = ProjectService(db)
    export_service = ExportService()
    
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    stages = list(project.stages)
    content = export_service.export_complete_zip(project, stages)
    
    quoted_name = quote(project.name)
    return Response(
        content=content,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename*=utf-8''{quoted_name}_complete.zip"}
    )
