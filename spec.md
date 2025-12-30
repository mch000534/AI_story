# AI 故事創作工具 - 技術規格文檔

> **文檔版本**: v1.0  
> **最後更新**: 2025-12-30  
> **技術棧**: Next.js + FastAPI + SQLite

---

## 目錄

1. [系統架構](#系統架構)
2. [數據模型設計](#數據模型設計)
3. [API 設計](#api-設計)
4. [前端架構](#前端架構)
5. [後端架構](#後端架構)
6. [AI 整合邏輯](#ai-整合邏輯)
7. [核心業務流程](#核心業務流程)
8. [安全性設計](#安全性設計)
9. [性能優化策略](#性能優化策略)

---

## 系統架構

### 整體架構圖

```
┌─────────────────────────────────────────────────────────┐
│                      用戶瀏覽器                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │          Next.js Frontend (Port 3000)             │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────┐  │  │
│  │  │  React UI   │  │  State Mgmt  │  │ API     │  │  │
│  │  │  Components │  │  (Zustand)   │  │ Client  │  │  │
│  │  └─────────────┘  └──────────────┘  └────┬────┘  │  │
│  └──────────────────────────────────────────┼────────┘  │
└─────────────────────────────────────────────┼───────────┘
                                              │
                                              │ HTTP/WebSocket
                                              ▼
┌─────────────────────────────────────────────────────────┐
│          FastAPI Backend (Port 8000)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  API Layer (routers)                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │  │
│  │  │ Projects │ │    AI    │ │  Export/Settings  │ │  │
│  │  └────┬─────┘ └────┬─────┘ └─────────┬─────────┘ │  │
│  └───────┼────────────┼─────────────────┼───────────┘  │
│          │            │                 │              │
│  ┌───────▼────────────▼─────────────────▼───────────┐  │
│  │           Service Layer (業務邏輯)                │  │
│  │  ┌──────────────┐  ┌──────────────────────────┐  │  │
│  │  │ AI Service   │  │  Project/Export Service  │  │  │
│  │  └──────┬───────┘  └───────────┬──────────────┘  │  │
│  └─────────┼──────────────────────┼─────────────────┘  │
│            │                      │                    │
│  ┌─────────▼──────────┐  ┌────────▼────────┐          │
│  │  AI API Client     │  │  SQLite DB      │          │
│  │  (OpenAI 相容)      │  │  (SQLAlchemy)   │          │
│  └────────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
        ┌───────────────────────┐
        │   外部 AI API          │
        │  (OpenAI/Claude/etc)  │
        └───────────────────────┘
```

### 技術選型理由

| 技術 | 選擇理由 |
|------|---------|
| **Next.js** | SSR/SSG 支持、優秀的開發體驗、內建路由和 API Routes |
| **FastAPI** | 高性能異步、自動 API 文檔、原生 Pydantic 驗證、WebSocket 支持 |
| **SQLite** | 零配置、輕量級、單文件存儲、適合個人/小團隊使用 |
| **Zustand** | 輕量級狀態管理、Hook-based API、無需 Provider 包裹 |
| **SQLAlchemy** | 成熟的 Python ORM、支持多種數據庫、易於遷移 |
| **Tailwind CSS** | 實用優先、快速開發、易於自定義主題 |

---

## 數據模型設計

### 核心實體關係

```
Project (專案)
  ├── id: UUID
  ├── name: String
  ├── description: String
  ├── created_at: DateTime
  ├── updated_at: DateTime
  ├── metadata: JSON (genre, tags, etc.)
  ├── ai_settings_id: FK → AISettings
  └── stages: List[Stage] (1對多)

Stage (創作階段)
  ├── id: UUID
  ├── project_id: FK → Project
  ├── stage_type: Enum (idea, story, script, ...)
  ├── status: Enum (pending, in_progress, completed)
  ├── content: Text
  ├── prompt_used: Text
  ├── created_at: DateTime
  ├── updated_at: DateTime
  └── versions: List[StageVersion] (1對多)

StageVersion (版本歷史)
  ├── id: UUID
  ├── stage_id: FK → Stage
  ├── content: Text
  ├── ai_model: String
  ├── ai_parameters: JSON (temperature, top_p, etc.)
  ├── created_at: DateTime
  └── is_current: Boolean

AISettings (AI 配置)
  ├── id: UUID
  ├── name: String
  ├── base_url: String
  ├── api_key_encrypted: String
  ├── model: String
  ├── temperature: Float
  ├── top_p: Float
  ├── is_default: Boolean
  └── created_at: DateTime
```

### SQLAlchemy 模型設計邏輯

#### Project 模型
- 使用 UUID 作為主鍵（避免可預測的 ID）
- `metadata` 使用 JSON 類型存儲靈活的元數據
- 軟刪除設計：添加 `deleted_at` 字段而非真正刪除
- 級聯刪除：刪除 Project 時同時刪除關聯的 Stage 和 Version

#### Stage 模型
- `stage_type` 使用 Enum 確保只有 8 種有效階段
- `status` 追蹤每個階段的完成狀態
- `content` 存儲當前活躍的內容
- 建立索引：`project_id + stage_type` 組合索引加速查詢

#### StageVersion 模型
- 保存每次 AI 生成或手動編輯的版本
- `is_current` 標記當前使用的版本
- `ai_parameters` JSON 存儲生成時的所有參數，便於重現

#### AISettings 模型
- `api_key_encrypted` 使用 AES-256 加密存儲
- 支持多組配置，通過 `is_default` 標記默認配置

---

## API 設計

### RESTful API 端點規劃

#### 專案管理 API

```
POST   /api/v1/projects              創建新專案
GET    /api/v1/projects              獲取專案列表（分頁）
GET    /api/v1/projects/{id}         獲取專案詳情
PUT    /api/v1/projects/{id}         更新專案基本信息
DELETE /api/v1/projects/{id}         刪除專案（軟刪除）
```

**請求/響應範例**：

```json
// POST /api/v1/projects
Request:
{
  "name": "時間悖論",
  "description": "關於時間旅行的科幻短片",
  "metadata": {
    "genre": "sci-fi",
    "targetLength": 120,
    "tags": ["science fiction", "thriller"]
  },
  "ai_settings_id": "uuid-here"
}

Response:
{
  "id": "project-uuid",
  "name": "時間悖論",
  "created_at": "2025-12-30T21:00:00Z",
  "stages": [
    {
      "stage_type": "idea",
      "status": "pending",
      "content": null
    },
    // ... 其他 7 個階段
  ]
}
```

#### AI 生成 API

```
POST   /api/v1/ai/generate           生成內容（支持 streaming）
POST   /api/v1/ai/regenerate         重新生成內容
GET    /api/v1/ai/stream/{task_id}   WebSocket 端點（streaming 回應）
```

**生成邏輯流程**：

1. **接收請求**：包含 project_id, stage_type, custom_prompt (可選)
2. **獲取上下文**：
   - 從數據庫讀取該專案的前置階段內容
   - 組裝上下文（idea → story → script 等依序）
3. **構建提示詞**：
   - 載入該階段的系統提示詞模板
   - 注入前置階段的內容作為上下文
   - 用戶自定義 prompt（如果有）
4. **調用 AI API**：
   - 使用專案關聯的 AI Settings
   - 支持 streaming 模式
5. **保存結果**：
   - 創建新的 StageVersion
   - 更新 Stage 的 content 和 status
6. **返回響應**：完整內容或 stream

#### 階段管理 API

```
GET    /api/v1/projects/{id}/stages/{type}          獲取特定階段
PUT    /api/v1/projects/{id}/stages/{type}          更新階段內容
GET    /api/v1/projects/{id}/stages/{type}/versions 獲取版本歷史
POST   /api/v1/projects/{id}/stages/{type}/restore  恢復到某個版本
```

#### 匯出 API

```
POST   /api/v1/export/script         匯出劇本（PDF/Word/Fountain）
POST   /api/v1/export/storyboard     匯出分鏡（PDF/Excel）
POST   /api/v1/export/prompts        匯出所有提示詞（JSON/TXT）
POST   /api/v1/export/complete       匯出完整專案（ZIP）
```

**匯出邏輯**：

- 使用任務隊列（後台處理）避免阻塞
- 生成的文件臨時存儲，提供下載鏈接
- 文件 24 小時後自動清理

#### 設定管理 API

```
GET    /api/v1/settings/ai           獲取所有 AI 配置
POST   /api/v1/settings/ai           創建新配置
PUT    /api/v1/settings/ai/{id}      更新配置
DELETE /api/v1/settings/ai/{id}      刪除配置
POST   /api/v1/settings/ai/{id}/test 測試 API 連接
```

### WebSocket 設計

**用途**：AI 生成時的實時 streaming

```
連接: ws://localhost:8000/ws/ai/generate

客戶端發送:
{
  "action": "start",
  "project_id": "uuid",
  "stage_type": "story",
  "ai_settings_id": "uuid"
}

服務器推送 (streaming):
{"type": "token", "content": "第一幕"}
{"type": "token", "content": "：物理學家"}
{"type": "token", "content": "亞歷克斯..."}
...
{"type": "complete", "total_tokens": 1500}

錯誤情況:
{"type": "error", "message": "API rate limit exceeded"}
```

---

## 前端架構

### 狀態管理設計（Zustand）

#### ProjectStore
```typescript
// 負責：專案的 CRUD、當前選中的專案
interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  
  // Actions
  fetchProjects: () => Promise<void>
  loadProject: (id: string) => Promise<void>
  createProject: (data: CreateProjectData) => Promise<Project>
  updateProject: (id: string, data: UpdateProjectData) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}
```

#### StageStore
```typescript
// 負責：階段內容管理、版本控制
interface StageStore {
  currentStage: StageType
  stages: Record<StageType, Stage>
  isGenerating: boolean
  
  // Actions
  setCurrentStage: (stage: StageType) => void
  updateStageContent: (stage: StageType, content: string) => Promise<void>
  generateStage: (stage: StageType) => Promise<void>
  loadVersions: (stage: StageType) => Promise<Version[]>
  restoreVersion: (versionId: string) => Promise<void>
}
```

#### SettingsStore
```typescript
// 負責：AI 配置管理
interface SettingsStore {
  aiSettings: AISettings[]
  currentSettings: AISettings | null
  
  // Actions
  fetchSettings: () => Promise<void>
  saveSettings: (settings: AISettings) => Promise<void>
  testConnection: (settingsId: string) => Promise<boolean>
  setDefaultSettings: (settingsId: string) => Promise<void>
}
```

### 組件層次結構

```
App
├── Layout
│   ├── Header (導航、用戶信息)
│   ├── Sidebar (專案列表、設定入口)
│   └── MainContent
│       └── ProjectEditor
│           ├── StageNavigator (階段導航條)
│           ├── EditorPanel
│           │   ├── RichTextEditor (主編輯器)
│           │   ├── AIGenerateButton
│           │   └── VersionHistory (版本控制面板)
│           └── PreviewPanel (可選的預覽面板)
└── Modals
    ├── SettingsModal (AI 設定)
    ├── ExportModal (匯出選項)
    └── VersionCompareModal (版本比較)
```

### 關鍵組件邏輯

#### StageNavigator 組件
**職責**：顯示 8 個階段的進度和狀態

**邏輯**：
1. 從 StageStore 獲取所有階段狀態
2. 根據 `status` 顯示不同顏色：
   - `pending`: 灰色
   - `in_progress`: 黃色
   - `completed`: 綠色
3. 點擊切換當前階段，調用 `setCurrentStage()`
4. 禁用邏輯：前一階段未完成時，後續階段不可點擊

#### AIGenerateButton 組件
**職責**：觸發 AI 生成並顯示進度

**邏輯**：
1. 點擊時調用 `stageStore.generateStage(currentStage)`
2. 顯示 loading 動畫和取消按鈕
3. 如果支持 streaming：
   - 建立 WebSocket 連接
   - 實時更新編輯器內容（逐字顯示）
4. 生成完成後：
   - 更新 Stage 狀態為 `completed`
   - 保存到數據庫
   - 解鎖下一階段

#### RichTextEditor 組件
**職責**：提供富文本編輯能力和自動保存

**邏輯**：
1. 使用 Tiptap 編輯器（支持 Markdown）
2. 監聽內容變化，debounce 2 秒後自動保存
3. 編輯時發送 PUT 請求到後端
4. 顯示保存狀態指示器（已保存/保存中）

### API 客戶端設計

```typescript
// lib/api/client.ts 核心邏輯

class APIClient {
  private baseURL: string
  private timeout: number
  
  // 通用請求方法
  async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
    // 1. 添加認證 header (如果需要)
    // 2. 處理錯誤重試（max 3 次）
    // 3. 統一錯誤處理和轉換
    // 4. 返回類型安全的數據
  }
  
  // 專用方法
  projects = {
    list: () => this.request('/projects'),
    get: (id) => this.request(`/projects/${id}`),
    create: (data) => this.request('/projects', {method: 'POST', body: data}),
    // ...
  }
  
  ai = {
    generate: (data) => this.request('/ai/generate', {method: 'POST', body: data}),
    streamGenerate: (data) => this.createWebSocket('/ws/ai/generate', data),
  }
  
  // WebSocket 輔助方法
  private createWebSocket(endpoint: string, data: any): WebSocket {
    // 建立連接、錯誤處理、重連邏輯
  }
}
```

---

## 後端架構

### 核心服務層設計

#### AIService (AI 調用服務)

**職責**：封裝 AI API 調用邏輯

```python
# services/ai_service.py 核心邏輯

class AIService:
    def __init__(self, settings: AISettings):
        self.client = self._create_client(settings)
        self.settings = settings
    
    async def generate_content(
        self,
        prompt: str,
        context: str = "",
        stream: bool = False
    ) -> Union[str, AsyncIterator[str]]:
        """
        生成內容的核心方法
        
        邏輯流程：
        1. 構建完整的 prompt (system + context + user prompt)
        2. 調用 AI API（使用 httpx 異步請求）
        3. 如果 stream=True，返回異步生成器
        4. 處理錯誤：超時、rate limit、invalid response
        5. 記錄 token 使用情況
        """
        pass
    
    def _create_client(self, settings: AISettings):
        """
        根據 settings 創建對應的 AI 客戶端
        支持：OpenAI、Claude、自定義端點
        """
        pass
    
    async def _handle_streaming(self, response):
        """
        處理 streaming 響應
        逐行解析 SSE (Server-Sent Events) 格式
        yield 每個 token
        """
        pass
```

#### PromptService (提示詞管理)

**職責**：管理和組裝提示詞

```python
# services/prompt_service.py 核心邏輯

class PromptService:
    # 預定義的階段提示詞模板
    STAGE_PROMPTS = {
        "idea": "...",
        "story": "你是一位經驗豐富的編劇。根據以下創意想法，擴展成完整的故事大綱...",
        # ... 其他階段
    }
    
    def build_prompt(
        self,
        stage_type: StageType,
        context: Dict[str, str],
        custom_prompt: Optional[str] = None
    ) -> str:
        """
        構建完整提示詞
        
        邏輯：
        1. 獲取該階段的模板
        2. 注入前置階段的內容作為上下文
           - idea → story: 注入 idea 內容
           - story → script: 注入 idea + story
        3. 如果有 custom_prompt，附加到末尾
        4. 返回完整 prompt
        """
        template = self.STAGE_PROMPTS[stage_type]
        
        # 組裝上下文
        context_text = self._build_context(stage_type, context)
        
        # 組合
        full_prompt = f"{template}\n\n{context_text}"
        if custom_prompt:
            full_prompt += f"\n\n特殊要求：{custom_prompt}"
        
        return full_prompt
    
    def _build_context(self, stage_type: StageType, context: Dict) -> str:
        """
        根據階段類型決定需要哪些前置內容
        
        依賴關係：
        - idea: 無依賴
        - story: 需要 idea
        - script: 需要 idea, story
        - character_design: 需要 story, script
        - scene_design: 需要 story, script
        - storyboard: 需要 script, character_design, scene_design
        - image_prompts: 需要 storyboard, character_design, scene_design
        - blocking_prompts: 需要 storyboard, scene_design
        """
        pass
```

#### ProjectService (專案管理)

**職責**：專案的業務邏輯

```python
# services/project_service.py 核心邏輯

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_project(self, data: ProjectCreate) -> Project:
        """
        創建專案
        
        邏輯：
        1. 創建 Project 記錄
        2. 為 8 個階段預創建 Stage 記錄（status=pending）
        3. 返回完整的專案對象
        """
        project = Project(**data.dict())
        self.db.add(project)
        
        # 創建 8 個階段
        for stage_type in StageType:
            stage = Stage(
                project_id=project.id,
                stage_type=stage_type,
                status="pending"
            )
            self.db.add(stage)
        
        self.db.commit()
        return project
    
    async def get_stage_context(
        self,
        project_id: str,
        current_stage: StageType
    ) -> Dict[str, str]:
        """
        獲取生成當前階段所需的前置階段內容
        
        邏輯：
        1. 查詢該專案的所有已完成階段
        2. 根據依賴關係篩選需要的階段
        3. 返回 {stage_type: content} 字典
        """
        pass
```

#### ExportService (匯出服務)

**職責**：生成各種格式的文檔

```python
# services/export_service.py 核心邏輯

class ExportService:
    async def export_script_pdf(self, project_id: str) -> bytes:
        """
        匯出劇本為 PDF
        
        邏輯：
        1. 獲取 script 階段的內容
        2. 使用 reportlab 或 weasyprint 生成 PDF
        3. 套用劇本格式模板（字體、間距、頁眉等）
        4. 返回 PDF 二進制數據
        """
        pass
    
    async def export_fountain(self, project_id: str) -> str:
        """
        匯出為 Fountain 格式（編劇軟件通用格式）
        
        邏輯：
        1. 獲取 script 內容
        2. 解析場景、對白、動作
        3. 轉換為 Fountain 語法
        4. 返回文本
        """
        pass
    
    async def export_storyboard_excel(self, project_id: str) -> bytes:
        """
        匯出分鏡表格
        
        邏輯：
        1. 獲取 storyboard 和 image_prompts 內容
        2. 使用 openpyxl 創建 Excel
        3. 表格列：鏡號、景別、運鏡、畫面描述、提示詞
        4. 返回 Excel 二進制
        """
        pass
```

### 中間件設計

#### CORS 中間件
```python
# middleware/cors.py

from fastapi.middleware.cors import CORSMiddleware

# 配置邏輯
origins = [
    "http://localhost:3000",  # 開發環境
    "https://yourdomain.com"  # 生產環境
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 速率限制中間件
```python
# middleware/rate_limit.py

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# 使用方式
@app.post("/api/v1/ai/generate")
@limiter.limit("10/minute")  # 每分鐘最多 10 次 AI 生成
async def generate_content(...):
    pass
```

### 數據庫會話管理

```python
# db/session.py 核心邏輯

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# SQLite 配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./ai_story.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite 需要
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 依賴注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 使用方式
@app.post("/api/v1/projects")
async def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    return await service.create_project(data)
```

---

## AI 整合邏輯

### 統一的 AI 客戶端接口

**設計目標**：支持多種 AI API，統一接口

```python
# utils/ai_client.py 核心設計

from abc import ABC, abstractmethod

class BaseAIClient(ABC):
    """抽象基類，定義統一接口"""
    
    @abstractmethod
    async def generate(
        self,
        messages: List[Dict],
        temperature: float,
        stream: bool = False
    ) -> Union[str, AsyncIterator[str]]:
        pass

class OpenAIClient(BaseAIClient):
    """OpenAI API 實現"""
    
    def __init__(self, api_key: str, base_url: str, model: str):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.client = httpx.AsyncClient()
    
    async def generate(self, messages, temperature, stream=False):
        """
        調用 OpenAI Chat Completions API
        
        邏輯：
        1. 構建請求 payload
        2. 發送 POST 到 /v1/chat/completions
        3. 如果 stream=True，處理 SSE 響應
        4. 錯誤處理：API 錯誤、網絡錯誤、超時
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": stream
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        if stream:
            return self._stream_generate(payload, headers)
        else:
            response = await self.client.post(
                f"{self.base_url}/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=120.0
            )
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    async def _stream_generate(self, payload, headers):
        """處理 streaming 響應"""
        async with self.client.stream(
            "POST",
            f"{self.base_url}/v1/chat/completions",
            json=payload,
            headers=headers
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    # 解析 SSE 格式
                    content = self._parse_sse_line(line)
                    if content:
                        yield content

class ClaudeClient(BaseAIClient):
    """Claude API 實現（類似邏輯）"""
    pass

# 工廠函數
def create_ai_client(settings: AISettings) -> BaseAIClient:
    """
    根據配置創建對應的客戶端
    
    邏輯：
    - 根據 base_url 判斷是哪種 API
    - OpenAI 相容端點都使用 OpenAIClient
    - Claude 使用 ClaudeClient
    """
    if "anthropic" in settings.base_url:
        return ClaudeClient(settings)
    else:
        return OpenAIClient(
            api_key=settings.api_key,
            base_url=settings.base_url,
            model=settings.model
        )
```

### Streaming 實現邏輯

**WebSocket 端點實現**：

```python
# api/v1/ai.py

from fastapi import WebSocket

@app.websocket("/ws/ai/generate")
async def websocket_generate(
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    """
    WebSocket streaming 生成
    
    邏輯流程：
    1. 接受連接
    2. 接收客戶端消息（project_id, stage_type）
    3. 獲取上下文和構建 prompt
    4. 調用 AI API streaming
    5. 逐 token 推送給客戶端
    6. 生成完成後保存到數據庫
    7. 關閉連接
    """
    await websocket.accept()
    
    try:
        # 接收請求
        data = await websocket.receive_json()
        project_id = data["project_id"]
        stage_type = data["stage_type"]
        
        # 獲取上下文
        project_service = ProjectService(db)
        context = await project_service.get_stage_context(
            project_id, stage_type
        )
        
        # 構建 prompt
        prompt_service = PromptService()
        prompt = prompt_service.build_prompt(stage_type, context)
        
        # 獲取 AI 設定
        settings = await get_project_ai_settings(project_id, db)
        ai_client = create_ai_client(settings)
        
        # Streaming 生成
        full_content = ""
        async for token in ai_client.generate(
            messages=[{"role": "user", "content": prompt}],
            temperature=settings.temperature,
            stream=True
        ):
            full_content += token
            # 推送給客戶端
            await websocket.send_json({
                "type": "token",
                "content": token
            })
        
        # 保存到數據庫
        await project_service.update_stage(
            project_id,
            stage_type,
            full_content
        )
        
        # 完成通知
        await websocket.send_json({
            "type": "complete",
            "total_length": len(full_content)
        })
        
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        await websocket.close()
```

---

## 核心業務流程

### 創作流程完整時序圖

```
用戶          前端            後端API         AI Service      數據庫
 │             │                │                │              │
 │  創建專案    │                │                │              │
 │────────────>│                │                │              │
 │             │ POST /projects │                │              │
 │             │───────────────>│                │              │
 │             │                │ 創建 Project   │              │
 │             │                │ 創建 8個 Stage │              │
 │             │                │────────────────────────────>│
 │             │                │<────────────────────────────│
 │             │<───────────────│                │              │
 │<────────────│                │                │              │
 │             │                │                │              │
 │  輸入想法    │                │                │              │
 │────────────>│                │                │              │
 │             │ PUT stage/idea │                │              │
 │             │───────────────>│                │              │
 │             │                │ 更新 Stage     │              │
 │             │                │────────────────────────────>│
 │             │<───────────────│                │              │
 │             │                │                │              │
 │  AI 生成故事 │                │                │              │
 │────────────>│                │                │              │
 │             │ WS connect     │                │              │
 │             │───────────────>│                │              │
 │             │                │ 獲取上下文      │              │
 │             │                │────────────────────────────>│
 │             │                │<────────────────────────────│
 │             │                │ 構建 prompt    │              │
 │             │                │ 調用 AI API    │              │
 │             │                │───────────────>│              │
 │             │                │  streaming... │              │
 │             │<──token───────│<───────────────│              │
 │<──顯示token──│                │                │              │
 │             │<──token───────│<───────────────│              │
 │<──顯示token──│                │                │              │
 │             │                │  complete      │              │
 │             │                │<───────────────│              │
 │             │                │ 保存 Version   │              │
 │             │                │────────────────────────────>│
 │             │<──complete────│                │              │
 │<────────────│                │                │              │
```

### 階段依賴邏輯

**問題**：某個階段需要哪些前置階段的內容？

**解決方案**：定義依賴映射表

```python
# constants/stages.py

STAGE_DEPENDENCIES = {
    StageType.IDEA: [],  # 無依賴
    StageType.STORY: [StageType.IDEA],
    StageType.SCRIPT: [StageType.IDEA, StageType.STORY],
    StageType.CHARACTER_DESIGN: [StageType.STORY, StageType.SCRIPT],
    StageType.SCENE_DESIGN: [StageType.STORY, StageType.SCRIPT],
    StageType.STORYBOARD: [
        StageType.SCRIPT,
        StageType.CHARACTER_DESIGN,
        StageType.SCENE_DESIGN
    ],
    StageType.IMAGE_PROMPTS: [
        StageType.STORYBOARD,
        StageType.CHARACTER_DESIGN,
        StageType.SCENE_DESIGN
    ],
    StageType.BLOCKING_PROMPTS: [
        StageType.STORYBOARD,
        StageType.SCENE_DESIGN
    ]
}

def get_required_stages(stage_type: StageType) -> List[StageType]:
    """獲取某階段所需的前置階段"""
    return STAGE_DEPENDENCIES.get(stage_type, [])
```

**使用場景**：
1. 生成時獲取上下文
2. 前端判斷階段是否可解鎖
3. 驗證數據完整性

---

## 安全性設計

### API Key 加密存儲

```python
# core/security.py

from cryptography.fernet import Fernet
import os

# 加密密鑰（應存儲在環境變數中）
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher = Fernet(ENCRYPTION_KEY)

def encrypt_api_key(api_key: str) -> str:
    """加密 API Key"""
    return cipher.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    """解密 API Key"""
    return cipher.decrypt(encrypted_key.encode()).decode()
```

**存儲邏輯**：
1. 用戶輸入 API Key
2. 後端接收後立即加密
3. 加密後的字符串存入數據庫
4. 使用時解密

**環境變數管理**：
```bash
# .env
ENCRYPTION_KEY=your-generated-fernet-key
DATABASE_URL=sqlite:///./ai_story.db
CORS_ORIGINS=http://localhost:3000
```

### 輸入驗證

**使用 Pydantic 強制驗證**：

```python
# schemas/project.py

from pydantic import BaseModel, Field, validator

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    metadata: Optional[Dict] = None
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('專案名稱不能為空')
        return v.strip()
    
    @validator('metadata')
    def validate_metadata(cls, v):
        if v and len(str(v)) > 10000:
            raise ValueError('metadata 過大')
        return v
```

### 錯誤處理

**統一錯誤響應格式**：

```python
# 定義錯誤響應模型
class ErrorResponse(BaseModel):
    error: str
    detail: str
    code: int

# 全局異常處理器
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "code": 500
        }
    )

# 業務異常
class AIGenerationError(Exception):
    pass

@app.exception_handler(AIGenerationError)
async def ai_error_handler(request, exc):
    return JSONResponse(
        status_code=503,
        content={
            "error": "AI Generation Failed",
            "detail": str(exc),
            "code": 503
        }
    )
```

---

## 性能優化策略

### 數據庫優化

#### 索引設計
```python
# models/stage.py

class Stage(Base):
    __tablename__ = "stages"
    
    id = Column(UUID, primary_key=True)
    project_id = Column(UUID, ForeignKey("projects.id"))
    stage_type = Column(Enum(StageType))
    
    # 複合索引：加速按專案和階段查詢
    __table_args__ = (
        Index('ix_stage_project_type', 'project_id', 'stage_type'),
    )
```

#### 查詢優化
```python
# 使用 joinedload 避免 N+1 查詢問題
from sqlalchemy.orm import joinedload

def get_project_with_stages(project_id: str, db: Session):
    return db.query(Project)\
        .options(joinedload(Project.stages))\
        .filter(Project.id == project_id)\
        .first()
```

### 前端優化

#### 虛擬滾動
對於大型文本（如長劇本），使用虛擬滾動：
```typescript
// 使用 react-window 或 react-virtualized
import { FixedSizeList } from 'react-window';

// 只渲染可見區域的內容
```

#### 代碼分割
```typescript
// 使用 Next.js 動態導入
const ExportModal = dynamic(() => import('@/components/ExportModal'), {
  loading: () => <Loading />,
  ssr: false
});
```

#### API 請求優化
```typescript
// 使用 React Query 實現緩存和請求去重
const { data, isLoading } = useQuery(
  ['project', projectId],
  () => api.projects.get(projectId),
  {
    staleTime: 5 * 60 * 1000, // 5分鐘內不重新請求
    cacheTime: 10 * 60 * 1000,
  }
);
```

### 後端優化

#### 異步處理
```python
# 使用 background tasks 處理匯出等耗時操作
from fastapi import BackgroundTasks

@app.post("/api/v1/export/script")
async def export_script(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 立即返回任務 ID
    task_id = generate_task_id()
    
    # 後台處理
    background_tasks.add_task(
        generate_pdf,
        project_id,
        task_id,
        db
    )
    
    return {"task_id": task_id, "status": "processing"}
```

#### 快取策略
```python
from cachetools import TTLCache

# 快取提示詞模板（不常變化）
prompt_cache = TTLCache(maxsize=100, ttl=3600)

def get_prompt_template(stage_type: StageType) -> str:
    if stage_type in prompt_cache:
        return prompt_cache[stage_type]
    
    template = load_template(stage_type)
    prompt_cache[stage_type] = template
    return template
```

---

## 部署架構

### Docker 容器化

```yaml
# docker-compose.yml 邏輯說明

version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/ai_story.db
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./data:/app/data  # 持久化數據庫文件
```

### 環境變數管理

**開發環境** (.env.development):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=sqlite:///./ai_story_dev.db
```

**生產環境** (.env.production):
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
DATABASE_URL=sqlite:///./data/ai_story.db
ENCRYPTION_KEY=production-key-here
```

---

## 測試策略

### 後端測試

```python
# tests/test_services/test_ai_service.py

import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_generate_content():
    """測試 AI 內容生成"""
    # Mock AI API 響應
    with patch('httpx.AsyncClient.post') as mock_post:
        mock_post.return_value.json.return_value = {
            "choices": [{"message": {"content": "生成的內容"}}]
        }
        
        service = AIService(mock_settings)
        result = await service.generate_content("測試 prompt")
        
        assert result == "生成的內容"
        mock_post.assert_called_once()

@pytest.mark.asyncio
async def test_project_creation():
    """測試專案創建"""
    service = ProjectService(test_db)
    project = await service.create_project({
        "name": "測試專案",
        "description": "描述"
    })
    
    # 驗證專案創建成功
    assert project.id is not None
    
    # 驗證 8 個階段都被創建
    stages = test_db.query(Stage).filter(
        Stage.project_id == project.id
    ).all()
    assert len(stages) == 8
```

### 前端測試

```typescript
// tests/components/AIGenerateButton.test.tsx

import { render, fireEvent, waitFor } from '@testing-library/react';
import AIGenerateButton from '@/components/AIGenerateButton';

test('點擊按鈕觸發生成', async () => {
  const mockGenerate = jest.fn();
  
  const { getByText } = render(
    <AIGenerateButton onGenerate={mockGenerate} />
  );
  
  fireEvent.click(getByText('AI 生成'));
  
  await waitFor(() => {
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });
});
```

---

## 總結

本技術規格文檔涵蓋了 AI 故事創作工具的核心設計邏輯：

1. **清晰的架構分層**：前端、後端、服務層、數據層各司其職
2. **靈活的 AI 整合**：支持多種 AI API，統一接口設計
3. **完善的數據模型**：支持版本控制、依賴管理
4. **高效的實現邏輯**：streaming、異步處理、快取優化
5. **安全性考量**：加密存儲、輸入驗證、錯誤處理

**下一步**：
- 根據本規格開始實作
- 創建詳細的 API 文檔（OpenAPI）
- 設計 UI/UX 原型
