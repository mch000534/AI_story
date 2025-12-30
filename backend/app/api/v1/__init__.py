"""API v1 module initialization."""
from fastapi import APIRouter

from .projects import router as projects_router
from .ai import router as ai_router
from .settings import router as settings_router
from .export import router as export_router

router = APIRouter()
router.include_router(projects_router)
router.include_router(ai_router)
router.include_router(settings_router)
router.include_router(export_router)

__all__ = ["router"]
