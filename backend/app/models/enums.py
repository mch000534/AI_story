"""
AI Story Backend - Enums
"""
from enum import Enum


class StageType(str, Enum):
    """8 stages of the story creation workflow."""
    IDEA = "idea"  # 靈感發想
    STORY = "story"  # 故事大綱
    SCRIPT = "script"  # 劇本初稿
    CHARACTER = "character"  # 角色設計
    SCENE = "scene"  # 場景設計
    STORYBOARD = "storyboard"  # 分鏡腳本
    IMAGE_PROMPT = "image_prompt"  # AI 圖像提示詞
    MOTION_PROMPT = "motion_prompt"  # 動態分鏡提示詞


class StageStatus(str, Enum):
    """Status of a stage."""
    LOCKED = "locked"  # Not yet available
    UNLOCKED = "unlocked"  # Available but empty
    IN_PROGRESS = "in_progress"  # Has content
    COMPLETED = "completed"  # Marked as done


# Stage order for navigation
STAGE_ORDER = [
    StageType.IDEA,
    StageType.STORY,
    StageType.SCRIPT,
    StageType.CHARACTER,
    StageType.SCENE,
    StageType.STORYBOARD,
    StageType.IMAGE_PROMPT,
    StageType.MOTION_PROMPT,
]

# Stage dependencies - what stages are needed to generate each stage
STAGE_DEPENDENCIES = {
    StageType.IDEA: [],  # 參考：專案名稱、描述、輸入的內容
    StageType.STORY: [StageType.IDEA],  # 參考：靈感發想、輸入的內容
    StageType.SCRIPT: [StageType.STORY],  # 參考：故事大綱、輸入的內容
    StageType.CHARACTER: [StageType.STORY, StageType.SCRIPT],  # 參考：故事大綱、劇本初稿、輸入的內容
    StageType.SCENE: [StageType.STORY, StageType.SCRIPT],  # 參考：故事大綱、劇本初稿、輸入的內容
    StageType.STORYBOARD: [StageType.STORY, StageType.SCRIPT],  # 參考：故事大綱、劇本初稿、輸入的內容
    StageType.IMAGE_PROMPT: [StageType.STORYBOARD],  # 參考：分鏡腳本、輸入的內容
    StageType.MOTION_PROMPT: [StageType.STORYBOARD],  # 參考：分鏡腳本、輸入的內容
}

# Stage display names
STAGE_NAMES = {
    StageType.IDEA: "靈感發想",
    StageType.STORY: "故事大綱",
    StageType.SCRIPT: "劇本初稿",
    StageType.CHARACTER: "角色設計",
    StageType.SCENE: "場景設計",
    StageType.STORYBOARD: "分鏡腳本",
    StageType.IMAGE_PROMPT: "AI 圖像提示詞",
    StageType.MOTION_PROMPT: "動態分鏡提示詞",
}
