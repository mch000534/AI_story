"""API v1 module initialization."""
from fastapi import APIRouter

from .projects import router as projects_router
from .ai import router as ai_router
from .settings import router as settings_router
from .export import router as export_router
from .prompts import router as prompts_router

router = APIRouter()
router.include_router(projects_router)
router.include_router(ai_router)
router.include_router(settings_router)
router.include_router(export_router)
router.include_router(prompts_router)

__all__ = ["router"]
