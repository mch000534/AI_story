"""
AI Story Backend - Story Templates API
"""
import os
import yaml
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/templates", tags=["Templates"])


def load_templates() -> List[Dict[str, Any]]:
    """Load story templates from YAML config."""
    config_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'config',
        'story_templates.yaml'
    )
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            return data.get('templates', [])
    except Exception as e:
        print(f"Warning: Failed to load templates: {e}")
        return []


class TemplateResponse(BaseModel):
    id: str
    name: str
    icon: str
    description: str


class TemplateDetailResponse(TemplateResponse):
    project: Dict[str, str]
    stages: Dict[str, str]


@router.get("/", response_model=List[TemplateResponse])
def list_templates():
    """List all available story templates."""
    templates = load_templates()
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "icon": t["icon"],
            "description": t["description"]
        }
        for t in templates
    ]


@router.get("/{template_id}", response_model=TemplateDetailResponse)
def get_template(template_id: str):
    """Get a specific story template by ID."""
    templates = load_templates()
    for t in templates:
        if t["id"] == template_id:
            return t
    raise HTTPException(status_code=404, detail="Template not found")
