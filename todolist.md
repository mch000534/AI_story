# AI 故事創作工具 - 開發待辦清單

> **專案狀態追蹤**  
> 最後更新：2025-12-31  
> 當前階段：階段 1-2 完成，前端核心開發進行中 (階段 3)

---

## 📋 任務圖例

- `[ ]` 待完成
- `[/]` 進行中
- `[x]` 已完成
- `[!]` 阻塞/需要決策
- `[~]` 可選/低優先級

---

## 階段 0：專案設置與規劃 ✅

### 0.1 需求分析
- [x] 撰寫需求文檔 (requirements.md)
- [x] 定義 8 個創作階段
- [x] 定義用戶故事和 GWT 驗收標準
- [x] 確定技術棧選型

### 0.2 技術設計
- [x] 撰寫技術規格文檔 (spec.md)
- [x] 設計系統架構圖
- [x] 設計數據模型
- [x] 設計 API 接口規範
- [x] 規劃安全性和性能優化策略

---

## 階段 1：環境與基礎設施搭建

### 1.1 開發環境配置
- [x] 創建專案 Git 倉庫
- [x] 設置 .gitignore 文件
- [ ] 配置 pre-commit hooks（程式碼格式化）
- [x] 編寫 README.md（專案說明、安裝指南）

### 1.2 後端基礎設施
- [x] 初始化 FastAPI 專案結構
  - [x] 創建 `backend/` 目錄
  - [x] 設置 `pyproject.toml` 和 `requirements.txt`
  - [x] 創建基本目錄結構（app/, tests/, alembic/）
- [/] 配置開發環境
  - [x] 設置虛擬環境 (venv 或 poetry)
  - [x] 安裝核心依賴（FastAPI, SQLAlchemy, Uvicorn）
  - [x] 配置 `.env.example` 模板
- [x] 設置程式碼規範工具
  - [x] 配置 Black（程式碼格式化）
  - [x] 配置 isort（import 排序）
  - [x] 配置 flake8 或 ruff（linting）
  - [x] 配置 mypy（類型檢查，可選）

### 1.3 前端基礎設施
- [x] 初始化 Next.js 專案
  - [x] 手動創建前端專案結構（因網路問題）
  - [x] 配置 TypeScript (tsconfig.json)
- [x] 安裝核心依賴（已在 package.json 中定義）
  - [ ] UI 庫：shadcn/ui 或 Material-UI
  - [x] 狀態管理：Zustand
  - [x] API 請求：axios 或 fetch wrapper
  - [x] 表單處理：react-hook-form + zod
  - [ ] 富文本編輯器：Tiptap 或 Lexical
- [/] 設置程式碼規範
  - [x] 配置 ESLint
  - [ ] 配置 Prettier
  - [ ] 設置 lint-staged

### 1.4 Docker 配置
- [x] 編寫 `backend/Dockerfile`
- [x] 編寫 `frontend/Dockerfile`
- [x] 編寫 `docker-compose.yml`
- [ ] 測試本地 Docker 構建和運行

---

## 階段 2：後端核心開發

### 2.1 數據庫層
- [x] 設置 SQLAlchemy 基礎配置
  - [x] 創建 `db/base.py` 和 `db/session.py`
  - [x] 配置 SQLite 連接
  - [x] 設置依賴注入 (get_db)
- [x] 定義數據模型
  - [x] 創建 `models/project.py` (Project 模型)
  - [x] 創建 `models/stage.py` (Stage 模型)
  - [x] 創建 `models/stage_version.py` (StageVersion 模型)
  - [x] 創建 `models/ai_settings.py` (AISettings 模型)
  - [x] 定義枚舉類型 (StageType, StageStatus)
  - [x] 添加索引和外鍵約束
- [x] 設置 Alembic 數據庫遷移
  - [x] 初始化 Alembic (`alembic init`)
  - [x] 配置 `alembic.ini` 和 `env.py`
  - [ ] 生成初始遷移腳本
  - [ ] 測試遷移：`alembic upgrade head`

### 2.2 Pydantic Schemas
- [x] 定義請求/響應模型
  - [x] `schemas/project.py` (ProjectCreate, ProjectUpdate, ProjectResponse)
  - [x] `schemas/stage.py` (StageUpdate, StageResponse)
  - [x] `schemas/ai.py` (AIGenerateRequest, AIGenerateResponse)
  - [x] `schemas/settings.py` (AISettingsCreate, AISettingsResponse)
- [x] 添加數據驗證規則
  - [x] 字段長度限制
  - [x] 自定義驗證器

### 2.3 核心服務層
- [x] **ProjectService** (`services/project_service.py`)
  - [x] `create_project()` - 創建專案並初始化 8 個階段
  - [x] `get_project()` - 獲取專案詳情
  - [x] `list_projects()` - 分頁查詢專案列表
  - [x] `update_project()` - 更新專案基本信息
  - [x] `delete_project()` - 軟刪除專案
  - [x] `get_stage_context()` - 獲取階段生成所需的上下文
- [x] **AIService** (`services/ai_service.py`)
  - [x] `generate_content()` - 調用 AI API 生成內容
  - [x] `stream_generate()` - Streaming 生成
  - [x] `_create_client()` - 根據配置創建 AI 客戶端
  - [ ] 錯誤處理和重試邏輯
- [x] **PromptService** (`services/prompt_service.py`)
  - [x] 定義 8 個階段的提示詞模板
  - [x] `build_prompt()` - 組裝完整提示詞
  - [x] `_build_context()` - 根據階段依賴獲取上下文
- [ ] **ExportService** (`services/export_service.py`)
  - [ ] `export_script_pdf()` - 匯出劇本為 PDF
  - [ ] `export_fountain()` - 匯出 Fountain 格式
  - [ ] `export_storyboard_excel()` - 匯出分鏡表格
  - [ ] `export_complete_zip()` - 打包完整專案

### 2.4 AI 客戶端實現
- [x] 創建抽象基類 (`utils/ai_client.py`)
  - [x] 定義 `BaseAIClient` 抽象類
  - [x] `generate()` 抽象方法
- [x] 實現 OpenAI 客戶端
  - [x] `OpenAIClient` 類
  - [x] 同步生成方法
  - [x] Streaming 生成方法
  - [x] SSE 解析邏輯
- [x] 實現工廠函數
  - [x] `create_ai_client()` - 根據配置創建客戶端
- [ ] 錯誤處理
  - [ ] API 錯誤（401, 429, 500）
  - [ ] 網絡超時
  - [ ] 重試機制（exponential backoff）

### 2.5 API 路由實現
- [x] **專案管理 API** (`api/v1/projects.py`)
  - [x] `POST /api/v1/projects` - 創建專案
  - [x] `GET /api/v1/projects` - 列表查詢（分頁）
  - [x] `GET /api/v1/projects/{id}` - 獲取詳情
  - [x] `PUT /api/v1/projects/{id}` - 更新專案
  - [x] `DELETE /api/v1/projects/{id}` - 刪除專案
- [x] **階段管理 API** (`api/v1/projects.py`)
  - [x] `GET /api/v1/projects/{id}/stages/{type}` - 獲取階段
  - [x] `PUT /api/v1/projects/{id}/stages/{type}` - 更新階段內容
  - [x] `GET /api/v1/projects/{id}/stages/{type}/versions` - 版本歷史
  - [x] `POST /api/v1/projects/{id}/stages/{type}/restore` - 恢復版本
- [x] **AI 生成 API** (`api/v1/ai.py`)
  - [x] `POST /api/v1/ai/generate` - 生成內容（同步）
  - [x] `WebSocket /ws/ai/generate` - Streaming 生成
- [x] **設定管理 API** (`api/v1/settings.py`)
  - [x] `GET /api/v1/settings/ai` - 獲取所有配置
  - [x] `POST /api/v1/settings/ai` - 創建配置
  - [x] `PUT /api/v1/settings/ai/{id}` - 更新配置
  - [x] `DELETE /api/v1/settings/ai/{id}` - 刪除配置
  - [x] `POST /api/v1/settings/ai/{id}/test` - 測試連接
- [x] **匯出 API** (`api/v1/export.py`)
  - [x] `POST /api/v1/export/script` - 匯出劇本
  - [x] `POST /api/v1/export/storyboard` - 匯出分鏡
  - [x] `POST /api/v1/export/prompts` - 匯出提示詞
  - [x] `POST /api/v1/export/complete` - 匯出完整專案

### 2.6 安全性實現
- [x] API Key 加密/解密 (`core/security.py`)
  - [x] 生成 Fernet 加密密鑰
  - [x] `encrypt_api_key()` 函數
  - [x] `decrypt_api_key()` 函數
- [x] 環境變數管理
  - [x] 使用 python-dotenv
  - [x] 配置類 (`core/config.py`)
- [x] 輸入驗證（通過 Pydantic 自動處理）

### 2.7 中間件配置
- [x] CORS 中間件（在 main.py 中配置）
- [ ] 速率限制中間件 (`middleware/rate_limit.py`)
  - [ ] 使用 slowapi
  - [ ] 設置 AI 生成端點限制（如 10/分鐘）
- [ ] 錯誤處理中間件
  - [ ] 全局異常處理器
  - [ ] 統一錯誤響應格式

### 2.8 應用入口
- [x] 創建 FastAPI 應用 (`app/main.py`)
  - [x] 初始化 FastAPI app
  - [x] 註冊所有路由
  - [x] 添加中間件
  - [x] 配置 CORS
  - [x] 設置啟動/關閉事件
- [ ] 測試運行
  - [ ] `uvicorn app.main:app --reload`
  - [ ] 訪問 `/docs` 查看自動生成的 API 文檔

---

## 階段 3：前端核心開發

### 3.1 項目結構設置
- [x] 創建目錄結構
  - [x] `components/` (UI 組件)
  - [x] `lib/` (工具庫)
  - [x] `hooks/` (自定義 Hooks)
  - [x] `stores/` (狀態管理)
  - [x] `types/` (TypeScript 類型)
  - [x] `constants/` (常數定義)
- [x] 配置路徑別名 (tsconfig.json)
  - [x] `@/components`, `@/lib`, `@/hooks` 等

### 3.2 設計系統與基礎組件
- [x] 設置主題系統
  - [x] 配置 Tailwind 主題 (colors, fonts)
  - [x] 創建 CSS 變數（深色/淺色模式）
  - [x] `styles/globals.css` 全局樣式
- [x] 實現基礎 UI 組件
  - [x] Button (多種變體：primary, secondary, ghost)
  - [x] Input (文字輸入框)
  - [x] Select (下拉選單 - 整合於 Settings)
  - [x] Modal (彈窗)
  - [x] Toast (提示訊息)
  - [x] Loading (載入動畫)
  - [x] Slider (溫度、top-p 參數調整)

### 3.3 API 客戶端層
- [x] 創建 API 客戶端 (`lib/api/client.ts`)
  - [x] 封裝 fetch 或 axios
  - [x] 統一錯誤處理
  - [x] 請求/響應攔截器
  - [x] 重試機制 (基本錯誤處理已包含)
- [x] 定義 API 端點 (`lib/api/endpoints.ts`)
  - [x] projects API
  - [x] stages API
  - [x] ai API
  - [x] settings API
  - [x] export API
- [ ] WebSocket 客戶端 (`lib/api/websocket.ts`)
  - [ ] 連接管理
  - [ ] 自動重連邏輯
  - [ ] 消息處理

### 3.4 TypeScript 類型定義
- [x] 定義數據類型 (`types/`)
  - [x] `project.ts` - Project, Stage, StageType, StageStatus
  - [x] `api.ts` - API 請求/響應類型
  - [x] `settings.ts` - AISettings
  - [x] `common.ts` - 通用類型（Pagination 等）

### 3.5 狀態管理 (Zustand)
- [x] **ProjectStore** (`stores/projectStore.ts`)
  - [x] State: projects, currentProject, isLoading
  - [x] Actions: fetchProjects, loadProject, createProject, updateProject, deleteProject
- [x] **StageStore** (`stores/stageStore.ts`)
  - [x] State: currentStage, stages, isGenerating, streamingContent
  - [x] Actions: setCurrentStage, updateStageContent, generateStage, loadVersions, restoreVersion
- [x] **SettingsStore** (`stores/settingsStore.ts`)
  - [x] State: aiSettings, currentSettings
  - [x] Actions: fetchSettings, saveSettings, testConnection, setDefaultSettings
- [x] **UIStore** (`stores/uiStore.ts`)
  - [x] State: theme, sidebarOpen, modals
  - [x] Actions: toggleTheme, toggleSidebar, openModal, closeModal

### 3.6 自定義 Hooks
- [ ] `useProject` (`hooks/useProject.ts`) - (已整合至 Store)
- [x] **useAI** (`hooks/useAI.ts`) - 封裝 WebSocket 邏輯
- [x] **useAutoSave** (`hooks/useAutoSave.ts`) - 自動保存邏輯
- [x] **useStageNavigation** (`hooks/useStageNavigation.ts`) - 階段導航邏輯

### 3.7 核心頁面組件
- [x] **首頁/專案列表** (`app/page.tsx`)
  - [x] 顯示所有專案（卡片網格）
  - [ ] 搜索和篩選功能
  - [x] 創建新專案按鈕
- [x] **專案編輯頁** (`app/project/[id]/page.tsx`)
  - [x] 頁面布局（Header + Sidebar + Main）
  - [x] 整合所有子組件
- [x] **設定頁** (`app/settings/page.tsx`)
  - [x] AI 配置管理界面
  - [ ] 主題切換
  - [ ] 關於頁面

### 3.8 專案編輯器組件
- [x] **Layout 組件**
  - [x] `Header` - 導航欄、專案標題、匯出按鈕
  - [x] `Sidebar` - 階段導航
  - [ ] `Footer` (可選)
- [x] **StageNavigator** (在 project/[id]/page.tsx 中實現)
  - [x] 顯示 8 個階段的進度條
  - [x] 根據 status 顯示不同顏色/圖標
  - [x] 點擊切換階段
  - [x] 解鎖邏輯（已移除強制限制，允許自由切換）
- [x] **EditorPanel** (在 project/[id]/page.tsx 中實現)
  - [x] 文字編輯器
  - [x] AI 生成按鈕
  - [x] 保存按鈕
- [x] **RichTextEditor** (`components/editor/RichTextEditor.tsx`)
  - [x] 使用 Tiptap 編輯器
  - [x] 支持 Markdown
  - [x] 自動保存（debounce）
- [x] **VersionHistory** (`components/editor/VersionHistory.tsx`)
  - [x] 顯示版本列表
  - [x] 版本預覽功能
  - [x] 恢復到指定版本

### 3.9 模態框組件
- [x] **SettingsModal** (在 settings/page.tsx 中實現)
  - [x] AI 配置表單
  - [x] 模型選擇輸入
  - [x] Temperature/Top-P 輸入
  - [x] 測試連接按鈕
  - [x] 保存/取消
- [x] **ExportModal** (`components/ExportModal.tsx`)
  - [x] 選擇匯出格式（PDF, Word, Fountain, Excel）
  - [x] 完整專案 ZIP 匯出
  - [x] 下載按鈕
- [x] **CreateProjectModal** (在 page.tsx 中實現)
  - [x] 專案名稱、描述輸入
  - [x] 創建按鈕
- [ ] **VersionCompareModal** (`components/editor/VersionCompareModal.tsx`)
  - [ ] 並排顯示兩個版本
  - [ ] Diff 高亮顯示

### 3.10 Streaming UI 實現
- [x] 實現 WebSocket 連接邏輯
  - [x] 連接到 `/ws/ai/generate`
  - [x] 接收 token 並逐字顯示
  - [x] 處理完成/錯誤消息
- [x] 打字機效果
  - [x] 平滑的逐字顯示動畫 (Streaming)
  - [ ] 閃爍光標效果
- [x] 進度指示器
  - [x] 顯示生成狀態（連接中、生成中、完成）
  - [x] Toast 提示完成或錯誤訊息

---

## 階段 4：功能整合與優化

### 4.1 前後端聯調
- [ ] 測試所有 API 端點
  - [ ] 專案 CRUD
  - [ ] 階段管理
  - [ ] AI 生成（同步和 streaming）
  - [ ] 設定管理
  - [ ] 匯出功能
- [ ] 修復跨域問題（CORS）
- [ ] 處理各種錯誤情況
  - [ ] 網絡錯誤
  - [ ] API 錯誤
  - [ ] 數據驗證錯誤

### 4.2 數據持久化與同步
- [ ] 前端快取策略
  - [ ] 使用 React Query 或 SWR
  - [ ] 設置合理的 staleTime 和 cacheTime
- [ ] 離線編輯支持（可選）
  - [ ] 使用 IndexedDB 本地存儲草稿
  - [ ] 在線時自動同步

### 4.3 性能優化
- [ ] 前端優化
  - [ ] 代碼分割（dynamic import）
  - [ ] 圖片優化（Next.js Image）
  - [ ] 虛擬滾動（長文本場景）
- [ ] 後端優化
  - [ ] 數據庫查詢優化（使用 joinedload）
  - [ ] 添加適當的索引
  - [ ] API 響應快取（可選）

### 4.4 用戶體驗優化
- [x] 添加 Loading 狀態
  - [x] 頁面載入
  - [x] API 請求
  - [x] AI 生成
- [ ] 錯誤提示優化
  - [ ] 友好的錯誤訊息
  - [ ] 重試選項
- [x] 成功反饋
  - [x] Toast 提示
  - [ ] 動畫效果
- [x] 快捷鍵支持（可選）
  - [x] Ctrl+S 保存
  - [x] Ctrl+G 生成
  - [x] 階段切換快捷鍵

### 4.5 響應式設計
- [ ] 桌面端適配（主要）
- [ ] 平板適配
- [ ] 移動端基本支持（可選）

---

## 階段 5：進階功能

### 5.1 版本管理與比較
- [ ] 完善版本歷史功能
  - [ ] 每次生成/編輯自動創建版本
  - [ ] 版本列表顯示（時間、AI 模型、參數）
- [ ] 版本對比功能
  - [ ] Diff 高亮顯示
  - [ ] 並排比較
- [ ] 版本恢復
  - [ ] 一鍵恢復到任意版本

### 5.2 匯出功能完善
- [ ] PDF 匯出
  - [ ] 使用 reportlab 或 weasyprint
  - [ ] 劇本格式模板（字體、間距、頁眉頁腳）
- [ ] Word 匯出
  - [ ] 使用 python-docx
  - [ ] 格式化文檔
- [ ] Fountain 格式匯出
  - [ ] 解析劇本結構
  - [ ] 轉換為 Fountain 語法
- [ ] Excel 分鏡表
  - [ ] 使用 openpyxl
  - [ ] 表格列：鏡號、景別、運鏡、畫面、提示詞
- [ ] ZIP 打包
  - [ ] 打包所有格式
  - [ ] 包含專案元數據

### 5.3 提示詞模板系統
- [ ] 8 個階段的專業提示詞模板
  - [ ] Idea → Story
  - [ ] Story → Script
  - [ ] Script → Character Design
  - [ ] Script → Scene Design
  - [ ] Script → Storyboard
  - [ ] Storyboard → Image Prompts
  - [ ] Storyboard → Blocking Prompts
- [ ] 提示詞變數替換
  - [ ] 注入前置階段內容
  - [ ] 支持自定義變數
- [ ] 用戶自定義提示詞（可選）
  - [ ] 保存常用提示詞
  - [ ] 提示詞模板管理

### 5.4 多 AI 模型支持
- [ ] 測試不同 AI API
  - [ ] OpenAI (GPT-4, GPT-3.5)
  - [ ] Claude (如果有 API)
  - [ ] 自定義 OpenAI 相容端點
- [ ] 模型切換界面優化
  - [ ] 預設模型列表
  - [ ] 自定義模型輸入
- [ ] 模型參數保存
  - [ ] 每個專案可以有獨立配置

---

## 階段 6：測試

### 6.1 後端測試
- [ ] 單元測試 (`tests/`)
  - [ ] 測試 ProjectService
  - [ ] 測試 AIService
  - [ ] 測試 PromptService
  - [ ] 測試 ExportService
- [ ] API 測試
  - [ ] 使用 pytest 和 httpx
  - [ ] 測試所有端點
  - [ ] 測試錯誤情況
- [ ] 設置測試數據庫
  - [ ] 使用內存 SQLite
  - [ ] Fixtures 和 factories

### 6.2 前端測試（可選）
- [ ] 組件測試
  - [ ] 使用 React Testing Library
  - [ ] 測試關鍵組件
- [ ] E2E 測試（可選）
  - [ ] 使用 Playwright 或 Cypress
  - [ ] 測試完整用戶流程

### 6.3 手動測試
- [ ] 測試所有用戶故事的驗收標準
  - [ ] 故事 1：新手編劇快速成稿
  - [ ] 故事 2：獨立導演前期準備
  - [ ] 故事 3：內容創作者快速原型
  - [ ] 故事 4：AI 愛好者實驗不同模型
- [ ] 跨瀏覽器測試
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

---

## 階段 7：文檔與部署

### 7.1 用戶文檔
- [ ] 編寫用戶指南 (`docs/USER_GUIDE.md`)
  - [ ] 快速開始
  - [ ] 功能介紹
  - [ ] 常見問題
  - [ ] 故障排除
- [ ] 錄製演示影片（可選）
  - [ ] 基本工作流程
  - [ ] 進階功能

### 7.2 開發者文檔
- [ ] API 文檔
  - [ ] FastAPI 自動生成的 OpenAPI 文檔已足夠
  - [ ] 補充自定義說明（如有需要）
- [ ] 部署指南 (`docs/DEPLOYMENT.md`)
  - [ ] 本地開發環境設置
  - [ ] Docker 部署
  - [ ] 雲端部署（如 Railway, Render, Vercel）
- [ ] 貢獻指南 (`docs/CONTRIBUTING.md`)

### 7.3 部署配置
- [ ] 環境變數配置
  - [ ] `.env.production` 模板
  - [ ] 環境變數說明文檔
- [ ] Docker 優化
  - [ ] 多階段構建
  - [ ] 減小鏡像大小
  - [ ] 健康檢查
- [ ] CI/CD 設置（可選）
  - [ ] GitHub Actions
  - [ ] 自動測試
  - [ ] 自動部署

### 7.4 生產部署
- [ ] 選擇部署平台
  - [ ] 前端：Vercel / Netlify
  - [ ] 後端：Railway / Render / DigitalOcean
  - [ ] 或使用 Docker Compose 全棧部署
- [ ] 配置域名和 SSL（可選）
- [ ] 監控和日誌（可選）
  - [ ] 錯誤追蹤（Sentry）
  - [ ] 性能監控

---

## 階段 8：後續優化（可選）

### 8.1 進階功能
- [ ] 多語言支持（i18n）
  - [ ] 前端界面多語言
  - [ ] 繁中、簡中、英文
- [ ] 協作功能
  - [ ] 多用戶支持
  - [ ] 權限管理
  - [ ] 實時協作編輯
- [ ] 模板系統
  - [ ] 預設故事模板（科幻、愛情、懸疑等）
  - [ ] 用戶自定義模板
- [ ] AI 分析功能
  - [ ] 劇本節奏分析
  - [ ] 角色發展弧線分析
  - [ ] 衝突點識別

### 8.2 性能和擴展性
- [ ] 升級到 PostgreSQL（如需多用戶）
- [ ] Redis 快取層
- [ ] CDN 配置
- [ ] 負載均衡

### 8.3 商業化準備（如需要）
- [ ] 用戶認證系統
  - [ ] JWT Token
  - [ ] OAuth (Google, GitHub)
- [ ] 訂閱/付費功能
  - [ ] Stripe 整合
  - [ ] 使用量追蹤
- [ ] 使用統計和分析
  - [ ] Google Analytics
  - [ ] 用戶行為追蹤

---

## 📊 里程碑追蹤

### Milestone 1: MVP (最小可行產品) - 預計 4-6 週
目標：完成核心功能，能夠完整跑通創作流程
- [x] 階段 0：專案設置與規劃
- [ ] 階段 1：環境與基礎設施搭建
- [ ] 階段 2：後端核心開發
- [ ] 階段 3：前端核心開發
- [ ] 階段 4：功能整合與優化

**驗收標準**:
1. 用戶可以創建專案
2. 完成 8 個階段的創作流程
3. AI 生成功能正常工作（至少支持一種 AI API）
4. 基本的匯出功能（至少一種格式）

### Milestone 2: 完整版本 - 預計 6-8 週
目標：完善所有功能，達到可發布狀態
- [ ] 階段 5：進階功能
- [ ] 階段 6：測試
- [ ] 階段 7：文檔與部署

**驗收標準**:
1. 所有用戶故事的驗收標準通過
2. 完整的匯出功能（多種格式）
3. 版本管理和比較功能
4. 完善的錯誤處理和用戶體驗
5. 通過測試並成功部署

### Milestone 3: 優化版本 - 持續
目標：根據反饋持續優化
- [ ] 階段 8：後續優化
- [ ] 用戶反饋收集與迭代

---

## 🎯 當前優先級

### P0 - 必須完成（MVP）
- 專案基礎設施搭建
- 數據庫和 API 開發
- 前端基本頁面和組件
- AI 生成核心功能
- 基本的 CRUD 操作

### P1 - 重要功能
- 版本管理
- 完整的匯出功能
- 優化的用戶體驗
- 錯誤處理

### P2 - 增強功能
- 進階 AI 配置
- 多種匯出格式
- 性能優化
- 完整測試覆蓋

### P3 - 可選功能
- 協作功能
- 模板系統
- 多語言支持
- 商業化功能

---

## 📝 注意事項

1. **逐步實現**：不要試圖一次完成所有功能，按優先級逐步實現
2. **頻繁測試**：每完成一個功能模塊就進行測試
3. **版本控制**：每個功能模塊完成後提交 Git
4. **文檔同步**：重要的設計決策和修改要同步更新到文檔
5. **用戶為中心**：始終考慮用戶體驗，功能要簡單易用

---

## ⏰ 預估時間（僅供參考）

- **階段 1**: 1-2 天
- **階段 2**: 1-1.5 週
- **階段 3**: 1.5-2 週
- **階段 4**: 3-5 天
- **階段 5**: 1 週
- **階段 6**: 3-5 天
- **階段 7**: 2-3 天

**總計**: 約 4-6 週（全職開發）

根據實際開發速度和遇到的問題，時間可能會有所調整。
