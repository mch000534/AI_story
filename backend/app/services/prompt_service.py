"""
AI Story Backend - Prompt Service
"""
from typing import Dict, Optional
from app.models.enums import StageType, STAGE_NAMES, STAGE_DEPENDENCIES


# Prompt templates for each stage
STAGE_PROMPTS = {
    StageType.IDEA: """你是一位專業的故事開發顧問。請根據以下靈感發想，提供更深入的概念發展建議：

用戶靈感：
{idea}

請從以下幾個方面進行擴展：
1. 故事類型與調性
2. 核心衝突
3. 主題思想
4. 目標受眾
5. 獨特賣點

請用繁體中文回覆，並保持專業但有創意的風格。""",

    StageType.STORY: """你是一位經驗豐富的劇本開發專家。請根據以下靈感概念，撰寫一份完整的故事大綱：

靈感概念：
{idea}

請包含以下元素：
1. 故事設定（時間、地點、背景）
2. 主要角色介紹
3. 三幕結構：
   - 第一幕：開場與鋪陳
   - 第二幕：衝突與發展
   - 第三幕：高潮與結局
4. 主題訊息

請提供約 800-1500 字的詳細大綱，使用繁體中文。""",

    StageType.SCRIPT: """你是一位專業編劇。請根據以下故事大綱，撰寫劇本初稿：

故事大綱：
{story}

劇本格式要求：
1. 場景標題格式：場號. 場景/地點 - 時間
2. 動作描述：簡潔描述場景和動作
3. 對話格式：
   角色名
   （動作/表情指示）
   對話內容

請撰寫完整的劇本初稿，包含所有場景和對話。使用繁體中文。""",

    StageType.CHARACTER: """你是一位角色設計專家。請根據劇本內容，為每個主要角色創建詳細的角色設計：

劇本內容：
{script}

角色設計請包含：
1. 基本資料（姓名、年齡、職業）
2. 外觀特徵（髮型、身材、穿著風格）
3. 性格特質
4. 背景故事
5. 角色動機
6. 角色弧線（發展變化）
7. 與其他角色的關係

請用繁體中文詳細描述每個主要角色。""",

    StageType.SCENE: """你是一位專業的美術指導。請根據劇本內容，設計主要場景：

劇本內容：
{script}

場景設計請包含：
1. 場景名稱與類型
2. 空間尺寸與格局
3. 環境氛圍（光線、色調、時間）
4. 重要道具與陳設
5. 視覺風格參考
6. 特殊效果需求

請為劇本中的每個主要場景提供詳細的設計說明。使用繁體中文。""",

    StageType.STORYBOARD: """你是一位專業的分鏡師。請根據劇本內容，創建分鏡腳本：

劇本內容：
{script}

分鏡格式：
鏡號 | 景別 | 運鏡 | 畫面描述 | 對白/音效 | 時長

景別選項：遠景、全景、中景、近景、特寫、大特寫
運鏡選項：固定、推、拉、搖、移、跟、升、降、手持

請為每個場景創建完整的分鏡表。使用繁體中文。""",

    StageType.IMAGE_PROMPT: """你是一位 AI 圖像生成專家。請根據分鏡腳本和角色/場景設計，為每個鏡頭生成 AI 圖像提示詞：

分鏡腳本：
{storyboard}

角色設計：
{character}

場景設計：
{scene}

提示詞格式要求：
1. 使用英文
2. 包含：主體、動作、場景、光線、風格、構圖
3. 加入適當的風格修飾詞
4. 標註負面提示詞（如需要）

格式：
鏡號 X：
Positive: [正面提示詞]
Negative: [負面提示詞]

請為每個鏡頭生成詳細的圖像提示詞。""",

    StageType.MOTION_PROMPT: """你是一位 AI 動態影像生成專家。請根據分鏡腳本，為每個鏡頭生成動態分鏡提示詞：

分鏡腳本：
{storyboard}

動態提示詞格式要求：
1. 使用英文
2. 包含：主體動作、運鏡描述、時長建議
3. 使用動態影片生成工具（如 Runway、Pika）的最佳實踐

格式：
鏡號 X：
Motion: [動態描述]
Camera: [運鏡指示]
Duration: [建議時長]

請為每個動態鏡頭生成提示詞。"""
}


class PromptService:
    """Service for building AI prompts."""
    
    def build_prompt(
        self, 
        stage_type: StageType, 
        context: Dict[str, str],
        custom_prompt: Optional[str] = None
    ) -> str:
        """Build a complete prompt for the given stage."""
        if custom_prompt:
            return self._format_prompt(custom_prompt, context)
        
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
