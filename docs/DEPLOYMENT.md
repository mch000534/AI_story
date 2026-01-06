# AI 故事創作工具 - 部署指南

## 本地開發環境

### 後端
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

---

## Docker 部署

### 使用 Docker Compose
```bash
docker-compose up -d
```

### 單獨構建
```bash
# 後端
docker build -t ai-story-backend ./backend
docker run -p 8000:8000 ai-story-backend

# 前端
docker build -t ai-story-frontend ./frontend
docker run -p 3000:3000 ai-story-frontend
```

---

## 雲端部署

### Railway
1. Fork 此專案
2. 連接 Railway
3. 設置環境變數
4. 部署

### Vercel (前端)
```bash
cd frontend
vercel
```

### Render (後端)
- 選擇 Web Service
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| DATABASE_URL | 資料庫連接 | sqlite:///./ai_story.db |
| SECRET_KEY | 加密金鑰 | 隨機生成 |
| CORS_ORIGINS | 允許的來源 | http://localhost:3000 |
