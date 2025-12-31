# AI 故事創作工具

一個基於 AI 的故事創作輔助工具，幫助編劇和創作者從靈感到完整劇本的創作流程。

## 🎯 核心功能

- **8 個創作階段**：靈感發想 → 故事大綱 → 劇本初稿 → 角色設計 → 場景設計 → 分鏡腳本 → AI 圖像提示詞 → 場景攝影機人物調度提示詞
- **AI 輔助生成**：支援多種 AI 模型（OpenAI、Claude 等相容 API），具備自動獲取模型列表功能
- **流暢體驗**：支援鍵盤快捷鍵、即時自動存檔、富文本編輯
- **即時回饋**：內建 Toast 通知系統，提供操作反饋
- **版本管理**：
  - 自動保存每次生成和編輯的版本
  - 全屏版本歷史彈窗，支持重命名和刪除
  - 並列版本對比（Diff）高亮顯示，支持一鍵套用
- **多格式匯出**：支援 PDF、Word、Fountain、Excel 等格式，解決中文字體顯示問題

## 🎹 快捷鍵

- `Ctrl + S` / `Cmd + S`：保存內容
- `Ctrl + G` / `Cmd + G`：觸發 AI 生成
- `Ctrl + H` / `Cmd + H`：切換版本歷史彈窗
- `Ctrl + Shift + ←/→`：切換創作階段 (後端自動加載)
- `ESC`：關閉所有彈窗
- 版本預覽中：`Ctrl + ↑/↓` 切換版本快照

## 📁 專案結構

```
AI_story/
├── backend/          # FastAPI 後端
│   ├── app/          # 應用程式核心
│   ├── tests/        # 測試檔案
│   └── alembic/      # 資料庫遷移
├── frontend/         # Next.js 前端
│   ├── app/          # 頁面路由
│   ├── components/   # UI 組件
│   └── lib/          # 工具函數
├── docs/             # 文檔
├── requirements.md   # 需求文檔
├── spec.md           # 技術規格
└── todolist.md       # 開發待辦清單
```

## 🚀 快速開始

### 環境要求

- Python 3.10+
- Node.js 18+
- npm 或 yarn

### 後端設置

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 編輯 .env 設置配置
uvicorn app.main:app --reload
```

### 前端設置

```bash
cd frontend
npm install
npm run dev
```

### Docker 運行（可選）

```bash
docker-compose up -d
```

## ⚙️ 環境變數

請參考 `.env.example` 設置以下環境變數：

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | 資料庫連接字串 |
| `SECRET_KEY` | 加密密鑰 |
| `AI_API_KEY` | AI API 金鑰（可選） |

## 📖 文檔

- [需求文檔](./requirements.md)
- [技術規格](./spec.md)
- [開發待辦清單](./todolist.md)

## 🛠️ 技術棧

### 後端
- FastAPI
- SQLAlchemy
- SQLite/PostgreSQL
- Pydantic

### 前端
- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand

## 📝 開發進度

請參考 [todolist.md](./todolist.md) 查看詳細開發進度。

## 📄 授權

MIT License
