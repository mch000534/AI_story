"""
AI Story Backend - Prompt Service
"""
import os
import yaml
from typing import Dict, Optional
from app.models.enums import StageType, STAGE_NAMES, STAGE_DEPENDENCIES


def load_default_prompts() -> Dict[StageType, str]:
    """Load default prompts from YAML config file."""
    config_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'config',
        'default_prompts.yaml'
    )
    
    prompts = {}
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            for stage in StageType:
                if stage.value in data:
                    prompts[stage] = data[stage.value]
    except FileNotFoundError:
        print(f"Warning: Config file not found at {config_path}")
    except Exception as e:
        print(f"Warning: Failed to load prompts config: {e}")
    
    return prompts


# Load prompts from config file
STAGE_PROMPTS = load_default_prompts()


from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.system_prompt import SystemPrompt


class PromptService:
    """Service for building AI prompts."""
    
    def build_prompt(
        self, 
        stage_type: StageType, 
        context: Dict[str, str],
        db: Session,
        custom_prompt: Optional[str] = None
    ) -> str:
        """Build a complete prompt for the given stage."""
        if custom_prompt:
            return self._format_prompt(custom_prompt, context)
        
        # Try to get from DB first
        stmt = select(SystemPrompt).where(SystemPrompt.stage == stage_type.value)
        db_prompt = db.execute(stmt).scalar_one_or_none()
        
        template = ""
        if db_prompt:
            template = db_prompt.content
        else:
            # Fallback to hardcoded default
            template = STAGE_PROMPTS.get(stage_type, "")
            
        if not template:
            raise ValueError(f"No template found for stage: {stage_type}")
        
        return self._format_prompt(template, context)
    
    def _format_prompt(self, template: str, context: Dict[str, str]) -> str:
        """Format the template with context variables."""
        # Replace placeholders with context values
        formatted = template
        for key, value in context.items():
            placeholder = "{" + key + "}"
            formatted = formatted.replace(placeholder, value or "[未提供]")
        
        return formatted
    
    def get_required_context(self, stage_type: StageType) -> list:
        """Get the required context keys for a stage."""
        dependencies = STAGE_DEPENDENCIES.get(stage_type, [])
        return [dep.value for dep in dependencies]
