# AI 故事創作工具 - 需求文檔

## 專案概述

本專案旨在開發一個AI輔助的故事創作工具，協助創作者從最初的想法逐步發展成完整的影視製作文檔。系統會引導用戶經過多個階段的創作流程，從概念發想到最終的分鏡腳本和技術指導，每個階段都由AI協助生成和優化內容。

### 核心價值
- **結構化創作流程**：將複雜的故事創作過程分解為清晰的步驟
- **AI 增強創作**：在每個階段提供AI輔助，提升創作效率和質量
- **靈活配置**：支持多種AI模型和自定義參數
- **完整輸出**：生成從劇本到分鏡的完整製作文檔

---

## 創作流程階段

### 1. 想法（Idea）
- 用戶輸入初始創意概念
- 簡短描述故事核心想法
- 關鍵詞或靈感來源

### 2. 故事（Story）
- 將想法擴展為完整故事大綱
- 包含起承轉合
- 確定主題和基調

### 3. 劇本（Script）
- 將故事轉化為對話和場景描述
- 包含場景編號和時間線
- 角色對白和動作描述

### 4. 人物設定（Character Design）
- 主要角色的詳細描述
- 外觀、性格、背景故事
- 角色關係圖
- 為每個角色生成AI繪圖提示詞，包含正反面、側面、背面、全身等多角度

### 5. 場景設定（Scene/Location Design）
- 重要場景的詳細描述
- 環境氛圍、道具、光線
- 場景參考圖描述
- 為每個場景生成AI繪圖提示詞

### 6. 分鏡劇本（Storyboard Script）
- 逐鏡頭的文字描述
- 鏡頭編號、景別、運鏡
- 對應的劇本時間碼

### 7. 分鏡圖提示詞（Storyboard Image Prompts）
- 為每個分鏡生成AI繪圖提示詞
- 包含構圖、光影、色調等細節

### 8. 場景攝影機人物調度提示詞（Scene Blocking & Camera Prompts）
- 詳細的拍攝指導
- 攝影機位置、移動、參數
- 演員走位和調度說明

---

## 用戶故事

### 故事 1：新手編劇快速成稿
**身份**：初學編劇的創作者  
**需求**：我想把腦海中的想法快速發展成完整劇本  
**目的**：不需要專業知識就能產出結構完整的劇本  

**驗收標準**：

**AC1**: 從想法開始創作
- **Given** 我是一個沒有編劇經驗的新手
- **When** 我輸入一段簡短的故事想法（少於 100 字）
- **Then** 系統應該引導我進入第一個創作階段，並顯示清晰的下一步提示

**AC2**: 完成完整創作流程
- **Given** 我已經輸入了初始想法
- **When** 我按照系統引導完成所有 8 個階段
- **Then** 系統應該生成一份結構完整的劇本文檔，包含場景、對白和分鏡

**AC3**: 隨時修改和調整
- **Given** 我已經完成了某個階段的內容生成
- **When** 我返回該階段並手動編輯內容
- **Then** 系統應該保存我的修改，並在後續階段使用更新後的內容

### 故事 2：獨立導演前期準備
**身份**：獨立電影導演  
**需求**：我需要為拍攝準備完整的分鏡和調度文檔  
**目的**：節省前期籌備時間，提高拍攝效率  

**驗收標準**：

**AC1**: 生成詳細分鏡腳本
- **Given** 我已經完成了劇本階段
- **When** 我進入分鏡階段並點擊 AI 生成
- **Then** 系統應該生成包含鏡頭編號、景別、運鏡的詳細分鏡腳本

**AC2**: 生成拍攝調度文檔
- **Given** 我已經完成了分鏡腳本
- **When** 我進入場景調度階段
- **Then** 系統應該生成包含攝影機位置、演員走位、技術參數的拍攝指導文檔

### 故事 3：內容創作者快速原型
**身份**：YouTube 短片創作者  
**需求**：我需要快速產出創意內容的腳本和視覺參考  
**目的**：加快內容生產速度  

**驗收標準**：

**AC1**: 快速生成短片內容
- **Given** 我輸入了一個短片創意（1-2 分鐘長度）
- **When** 我使用 AI 生成功能快速完成所有階段
- **Then** 系統應該在 5 分鐘內生成完整的腳本和視覺參考

**AC2**: 生成視覺參考提示詞
- **Given** 我已經完成了分鏡劇本
- **When** 我進入分鏡圖提示詞階段
- **Then** 系統應該為每個分鏡自動生成可直接用於 AI 繪圖工具的提示詞

### 故事 4：AI 愛好者實驗不同模型
**身份**：AI 技術愛好者  
**需求**：我想測試不同 AI 模型的創作效果  
**目的**：比較不同模型的輸出質量  

**驗收標準**：

**AC1**: 切換 AI 模型
- **Given** 我在設定頁面配置了兩個不同的 AI 模型
- **When** 我在創作過程中切換模型並重新生成同一階段的內容
- **Then** 系統應該使用新模型生成內容，並將兩個版本都保存下來供我比較

**AC2**: 調整模型參數
- **Given** 我想要更有創意的輸出結果
- **When** 我將 Temperature 從 0.7 調整到 1.5
- **Then** 系統應該使用新參數重新生成內容，輸出應該更加多樣化和創意

---

## 具體需求

### 功能需求

#### F1. AI 設定管理
- **F1.1** 提供設定頁面，包含以下欄位：
  - AI Base URL（支持 OpenAI相容自訂端點）
  - API Key（加密儲存）
  - 模型選擇（下拉選單，支持自訂輸入）
  - Temperature（滑桿，範圍 0.0-2.0）
  - Top-P（滑桿，範圍 0.0-1.0）

- **F1.2** 設定驗證
  - 在保存設定時測試 API 連接
  - 顯示連接狀態和錯誤訊息
  - 支持多組設定檔切換

- **F1.3** 設定持久化
  - 將設定保存到本地（加密存儲 API Key）
  - 支持導入/導出設定

#### F2. 創作流程管理
- **F2.1** 階段導航
  - 清晰顯示當前所在階段
  - 顯示已完成和待完成的階段
  - 支持在階段間前後移動
  - 每個階段都可以重新編輯

- **F2.2** 內容生成
  - 每個階段提供「AI 生成」按鈕
  - 根據前一階段的內容自動生成
  - 顯示生成進度和狀態
  - 支持停止生成

- **F2.3** 手動編輯
  - 所有生成的內容都可手動編輯
  - 提供富文本編輯器
  - 實時保存草稿
  - 支持撤銷/重做

- **F2.4** 版本管理
  - 保存每次生成的版本
  - 可以比對不同版本
  - 恢復到歷史版本

#### F3. 專案管理
- **F3.1** 專案創建與保存
  - 創建新專案
  - 命名和描述專案
  - 保存專案進度
  - 載入已有專案

- **F3.2** 匯出功能
  - 匯出完整劇本（PDF、Word、Fountain 格式）
  - 匯出分鏡腳本（PDF、Excel）
  - 匯出提示詞集（TXT、JSON）
  - 匯出場景調度表（PDF）

#### F4. 提示詞工程
- **F4.1** 內建專業提示詞模板
  - 每個階段預設優化的提示詞
  - 提示詞包含創作指導和格式要求
  - 提示詞可自訂修改

- **F4.2** 上下文管理
  - 自動將前面階段的內容作為上下文
  - 智能摘要長文本避免超過 token 限制
  - 保留關鍵信息的連貫性

### 非功能需求

#### NF1. 效能要求
- AI 生成響應時間 < 30 秒（取決於 API）
- 頁面切換響應 < 500ms
- 支持大型專案（>100頁劇本）

#### NF2. 可用性要求
- 直觀的用戶界面，無需教學即可上手
- 響應式設計，支持桌面和平板
- 深色/淺色主題切換
- 多語言支持（繁體中文優先）

#### NF3. 安全性要求
- API Key 加密存儲
- 本地數據加密
- 不將用戶數據上傳到第三方服務器（除了 AI API）

#### NF4. 相容性要求
- 支持主流瀏覽器（Chrome、Firefox、Safari、Edge）
- 支持離線編輯（AI 功能需要網絡）

---

## 技術要求

### 前端技術棧
- **框架**：React 或 Next.js（建議 Next.js 以支持 SSG/SSR）
- **UI 庫**：
  - 組件庫：shadcn/ui 或 Material-UI
  - 樣式：Tailwind CSS
  - 圖標：Lucide Icons 或 React Icons
- **狀態管理**：
  - Zustand 或 Redux Toolkit（全局狀態）
  - React Query（API 請求管理）
- **編輯器**：
  - Lexical 或 Tiptap（富文本編輯）
  - Monaco Editor（代碼/提示詞編輯）
- **數據持久化**：
  - IndexedDB（使用 Dexie.js）
  - LocalStorage（設定和快取）

### 後端技術棧
- **框架**：Python FastAPI
  - 高性能異步框架
  - 自動生成 OpenAPI 文檔
  - 原生支持 async/await
  - 內建數據驗證（Pydantic）

- **核心功能**：
  - RESTful API 設計
  - AI API 代理（OpenAI 相容接口）
  - WebSocket 支持（實時 streaming）
  - 請求速率限制和快取
  - CORS 配置

- **數據庫**：
  - SQLite（輕量級、無需額外配置）
  - SQLAlchemy（ORM）
  - Alembic（數據庫遷移）

- **認證與安全**：
  - JWT Token 認證（可選）
  - API Key 加密存儲
  - 環境變數管理（python-dotenv）

- **部署**：
  - Uvicorn（ASGI 伺服器）
  - Docker 容器化
  - 支持單機部署或雲端部署

### AI 整合
- **支持的 API**：
  - OpenAI GPT-4/GPT-3.5
  - Anthropic Claude
  - Google Gemini
  - 本地模型（Ollama、LM Studio）
  - 任何 OpenAI 相容的 API

- **API 客戶端**：
  - 使用標準 HTTP 請求
  - 支持 streaming 回應
  - 錯誤處理和重試機制

### 開發工具
- **建置工具**：Vite 或 Next.js 內建
- **代碼質量**：ESLint、Prettier
- **測試**：Vitest、React Testing Library（可選）
- **版本控制**：Git

---

## 範例

### 範例 1：從想法到劇本

#### 輸入（想法）
```
一個關於時間旅行者的故事，他回到過去試圖阻止一場災難，
但發現自己的行為反而導致了這場災難的發生。
```

#### 輸出（故事大綱）
```
標題：《時間的悖論》

第一幕：
物理學家亞歷克斯發明了時間機器，發現三個月後將發生毀滅性的核災難。
他決定回到過去，阻止當時的一個關鍵決策。

第二幕：
亞歷克斯回到過去，成功說服了政府官員改變決策。
但在回到現在後，他驚恐地發現災難仍然發生，只是形式不同。
他多次嘗試改變過去，每次都導致不同的災難性後果。

第三幕：
亞歷克斯意識到，正是他的時間旅行行為本身擾亂了時空，
創造了一個不穩定的時間線。他必須做出最終選擇：
接受原本的歷史，或者永遠困在時間循環中。

主題：因果關係、自由意志與命運、責任
```

#### 輸出（分鏡圖提示詞範例）
```
鏡頭 1：
[廣角，高角度] 未來城市夜景，霓虹燈閃爍，一座巨大的核電廠在遠處冒出黑煙，
城市籠罩在不祥的紅光中。電影級質感，賽博朋克風格，暗調，戲劇性光影。

鏡頭 2：
[特寫] 亞歷克斯的臉部，額頭布滿汗珠，眼神堅定又疲憊，
背景是時間機器的藍色冷光反射在他臉上。高對比度，邊緣光，情緒張力。

鏡頭 3：
[中景，荷蘭角] 時間機器啟動的瞬間，電弧閃爍，周圍空間扭曲變形，
物體開始分解成粒子。科幻視覺特效，高速攝影感，能量爆發。
```

---

### 範例 2：場景調度提示詞

```
場景：核電廠控制室對峙

【攝影機設置】
- 主機位：A-Camera，廣角鏡（24mm），軌道移動
- 輔助機位：B-Camera，中焦（50mm），固定特寫
- 燈光：頂光 + 側逆光，營造緊張氛圍

【演員調度】
時間碼 00:00-00:15：
- 亞歷克斯從畫面左側進入，快步走向控制台
- 官員在控制台後方，由坐姿起立
- A-Camera 跟隨亞歷克斯移動，軌道推進

時間碼 00:15-00:30：
- 兩人對峙，亞歷克斯在畫面右側，官員在左側
- B-Camera 切換正反打，捕捉表情
- 背景工作人員緩慢移動，增加畫面層次

時間碼 00:30-00:45：
- 亞歷克斯激動地指向螢幕
- A-Camera 搖到螢幕特寫，顯示災難數據
- 回切雙人中景，官員表情變化

【技術參數】
- 幀率：24fps（電影感）
- 色溫：冷色調（5000K）
- 景深：淺景深，主體突出
```

---

## 專案目錄結構

```
ai-story-tool/
├── frontend/                        # 前端應用
│   ├── public/                      # 靜態資源
│   │   ├── favicon.ico
│   │   └── images/
│   │       └── logo.png
│   │
│   ├── src/
│   ├── components/                  # React 組件
│   │   ├── layout/                  # 布局組件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── editor/                  # 編輯器組件
│   │   │   ├── RichTextEditor.tsx
│   │   │   ├── PromptEditor.tsx
│   │   │   └── VersionCompare.tsx
│   │   │
│   │   ├── workflow/                # 工作流程組件
│   │   │   ├── StageNavigator.tsx   # 階段導航
│   │   │   ├── StageCard.tsx        # 單個階段卡片
│   │   │   ├── ProgressBar.tsx
│   │   │   └── GenerationPanel.tsx  # AI 生成面板
│   │   │
│   │   ├── settings/                # 設定組件
│   │   │   ├── AISettings.tsx       # AI 設定表單
│   │   │   ├── ModelSelector.tsx
│   │   │   └── ConnectionTest.tsx
│   │   │
│   │   └── common/                  # 通用組件
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Loading.tsx
│   │
│   ├── pages/                       # 頁面（Next.js）或路由
│   │   ├── index.tsx                # 首頁/專案列表
│   │   ├── project/
│   │   │   └── [id].tsx             # 專案編輯頁
│   │   ├── settings.tsx             # 設定頁
│   │   └── export.tsx               # 匯出頁面
│   │
│   ├── lib/                         # 工具庫和核心邏輯
│   │   ├── api/                     # API 調用
│   │   │   ├── client.ts            # API 客戶端（調用後端）
│   │   │   ├── endpoints.ts         # API 端點定義
│   │   │   └── websocket.ts         # WebSocket 連接
│   │   │
│   │   ├── storage/                 # 前端數據快取
│   │   │   ├── cache.ts             # 本地快取管理
│   │   │   └── sync.ts              # 與後端同步
│   │   │
│   │   ├── export/                  # 匯出功能
│   │   │   ├── pdf.ts
│   │   │   ├── word.ts
│   │   │   └── fountain.ts
│   │   │
│   │   └── utils/                   # 工具函數
│   │       ├── format.ts            # 格式化
│   │       └── validation.ts        # 前端驗證
│   │
│   │   ├── hooks/                   # 自訂 React Hooks
│   │   │   ├── useAI.ts             # AI 生成 hook
│   │   │   ├── useProject.ts        # 專案管理 hook
│   │   │   ├── useSettings.ts       # 設定管理 hook
│   │   │   └── useAutoSave.ts       # 自動存檔 hook
│   │
│   │   ├── stores/                  # 狀態管理
│   │   │   ├── projectStore.ts      # 專案狀態
│   │   │   ├── settingsStore.ts     # 設定狀態
│   │   │   └── uiStore.ts           # UI 狀態
│   │
│   │   ├── types/                   # TypeScript 類型定義
│   │   │   ├── project.ts           # 專案相關類型
│   │   │   ├── api.ts               # API 相關類型
│   │   │   └── settings.ts          # 設定相關類型
│   │
│   │   ├── constants/               # 常數定義
│   │   │   ├── stages.ts            # 階段定義
│   │   │   └── config.ts            # 配置常數
│   │
│   │   └── styles/                  # 樣式文件
│   │       ├── globals.css
│   │       └── themes.css
│   │
│   ├── .env.example                 # 前端環境變數範例
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js               # Next.js 配置
│   ├── tailwind.config.js           # Tailwind 配置
│   └── README.md                    # 前端說明
│
├── backend/                         # 後端應用（Python FastAPI）
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI 應用入口
│   │   │
│   │   ├── api/                     # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── ai.py            # AI 生成相關端點
│   │   │   │   ├── projects.py      # 專案管理端點
│   │   │   │   ├── settings.py      # 設定管理端點
│   │   │   │   └── export.py        # 匯出功能端點
│   │   │   └── deps.py              # 依賴注入
│   │   │
│   │   ├── core/                    # 核心功能
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # 配置管理
│   │   │   ├── security.py          # 安全相關（加密、JWT）
│   │   │   └── prompts.py           # 提示詞模板
│   │   │
│   │   ├── services/                # 業務邏輯層
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py        # AI API 調用服務
│   │   │   ├── project_service.py   # 專案管理服務
│   │   │   ├── export_service.py    # 匯出服務
│   │   │   └── prompt_service.py    # 提示詞處理服務
│   │   │
│   │   ├── models/                  # 數據模型（SQLAlchemy）
│   │   │   ├── __init__.py
│   │   │   ├── project.py           # 專案模型
│   │   │   ├── stage.py             # 階段模型
│   │   │   └── settings.py          # 設定模型
│   │   │
│   │   ├── schemas/                 # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── project.py           # 專案 schema
│   │   │   ├── ai.py                # AI 請求/響應 schema
│   │   │   └── settings.py          # 設定 schema
│   │   │
│   │   ├── db/                      # 數據庫相關
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # 數據庫基礎配置
│   │   │   └── session.py           # 數據庫會話管理
│   │   │
│   │   ├── utils/                   # 工具函數
│   │   │   ├── __init__.py
│   │   │   ├── ai_client.py         # AI API 客戶端
│   │   │   ├── streaming.py         # Stream 處理
│   │   │   └── helpers.py           # 輔助函數
│   │   │
│   │   └── middleware/              # 中間件
│   │       ├── __init__.py
│   │       ├── cors.py              # CORS 配置
│   │       └── rate_limit.py        # 速率限制
│   │
│   ├── alembic/                     # 數據庫遷移
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── tests/                       # 後端測試
│   │   ├── __init__.py
│   │   ├── test_api/
│   │   ├── test_services/
│   │   └── conftest.py
│   │
│   ├── .env.example                 # 後端環境變數範例
│   ├── .gitignore
│   ├── requirements.txt             # Python 依賴
│   ├── pyproject.toml               # Python 專案配置
│   ├── alembic.ini                  # Alembic 配置
│   └── README.md                    # 後端說明
│
├── docs/                            # 專案文檔
│   ├── USER_GUIDE.md                # 用戶指南
│   ├── API.md                       # API 文檔
│   ├── DEPLOYMENT.md                # 部署指南
│   └── CONTRIBUTING.md              # 貢獻指南
│
├── docker/                          # Docker 配置
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── docker-compose.yml
│
├── .gitignore
└── README.md                        # 專案總說明
```

---

## 數據結構設計

### Project（專案）
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  stages: {
    idea: Stage;
    story: Stage;
    script: Stage;
    characterDesign: Stage;
    sceneDesign: Stage;
    storyboard: Stage;
    imagePrompts: Stage;
    blockingPrompts: Stage;
  };
  settings: AISettings;  // 專案級別的 AI 設定
  metadata: {
    genre?: string;
    targetLength?: number;
    tags?: string[];
  };
}
```

### Stage（階段）
```typescript
interface Stage {
  id: string;
  type: StageType;
  status: 'pending' | 'in-progress' | 'completed';
  content: string;  // 當前內容
  versions: Version[];  // 版本歷史
  prompt?: string;  // 使用的提示詞
  generatedAt?: Date;
}

interface Version {
  id: string;
  content: string;
  createdAt: Date;
  aiModel?: string;
  parameters?: AIParameters;
}
```

### AISettings（AI 設定）
```typescript
interface AISettings {
  id: string;
  name: string;  // 設定檔名稱
  baseURL: string;
  apiKey: string;  // 加密存儲
  model: string;
  temperature: number;
  topP: number;
  maxTokens?: number;
  systemPrompt?: string;
  isDefault: boolean;
}
```

---

## 未來擴展可能

### 階段 2 功能（可選）
- **協作功能**：多人協作編輯同一專案
- **模板系統**：預設不同類型的故事模板（科幻、愛情、懸疑等）
- **AI 分析**：分析劇本的節奏、角色發展等
- **視覺參考庫**：整合圖片搜索和管理
- **預算估算**：根據分鏡自動估算拍攝成本
- **排程工具**：生成拍攝日程表

### 階段 3 功能（可選）
- **語音輸入**：語音轉文字，快速記錄想法
- **AI 配音**：為角色生成配音參考
- **3D 預覽**：簡單的 3D 場景預覽
- **雲端同步**：跨設備同步專案
- **社群分享**：分享和發現其他創作者的作品

---

## 開發優先級

### P0（核心功能，第一版必須）
- 8 個階段的基本流程
- AI 生成和手動編輯
- AI 設定管理
- 專案保存和載入
- 基本匯出（TXT、PDF）

### P1（重要功能，第二版）
- 版本管理和比對
- 富文本編輯器
- 進階匯出格式（Fountain、Excel）
- 設定檔管理
- 深色模式

### P2（增強功能，第三版）
- 模板系統
- 批量操作
- 搜索和過濾
- 性能優化
- 完整的測試覆蓋

---

## 成功指標

### 用戶體驗指標
- 新用戶從註冊到完成第一個完整流程 < 30 分鐘
- 用戶滿意度 > 4.0/5.0
- 功能完成率 > 80%（開始的專案中完成到最後階段的比例）

### 技術指標
- 頁面載入時間 < 2 秒
- AI 生成成功率 > 95%
- 數據丟失率 = 0%
- 主流瀏覽器相容性 100%

### 業務指標
- 用戶留存率（7 日）> 40%
- 平均每用戶創建專案數 > 3
- 導出功能使用率 > 60%

---

## 風險與挑戰

### 技術風險
- **AI API 限制**：速率限制、成本、可用性
  - 緩解：實現重試機制、降級策略、本地快取
  
- **數據安全**：API Key 洩露風險
  - 緩解：加密存儲、安全最佳實踐、用戶教育

- **性能問題**：大型專案可能導致緩慢
  - 緩解：虛擬滾動、分頁載入、性能監控

### 產品風險
- **學習曲線**：功能太複雜導致用戶流失
  - 緩解：提供教學、簡化初始流程、漸進式展示功能

- **輸出質量**：AI 生成內容不符合期望
  - 緩解：優化提示詞、提供編輯功能、版本管理

### 市場風險
- **競爭**：類似工具的出現
  - 緩解：持續創新、專注用戶體驗、建立社群

---

## 結論

本專案旨在創建一個完整的 AI 輔助故事創作工具，涵蓋從創意發想到技術執行的全流程。通過結構化的 8 個階段和靈活的 AI 配置，為創作者提供強大而易用的創作平台。

**下一步行動**：
1. 確認需求文檔
2. 設計 UI/UX 原型
3. 技術架構設計
4. 開發環境搭建
5. 迭代開發與測試
