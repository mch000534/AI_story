# AI 故事創作工具 - 用戶指南

## 快速開始

### 1. 環境準備

```bash
# 後端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 前端
cd frontend
npm install
npm run dev
```

訪問 http://localhost:3000

### 2. 配置 AI

1. 進入「設定」頁面
2. 點擊「新增配置」
3. 填寫 API Key 和 Base URL
4. 選擇模型後保存

支援的 API：
- OpenAI (api.openai.com)
- OpenRouter (openrouter.ai)
- 任何 OpenAI 相容端點

---

## 功能介紹

### 8 階段創作流程

| 階段 | 說明 |
|------|------|
| 💡 靈感發想 | 輸入故事概念，AI 擴展創意 |
| 📖 故事大綱 | 生成完整三幕結構 |
| 📝 劇本初稿 | 撰寫場景與對話 |
| 👤 角色設計 | 詳細角色背景與外觀 |
| 🏠 場景設計 | 場景氛圍與陳設 |
| 🎬 分鏡腳本 | 鏡號、景別、運鏡 |
| 🖼️ AI 圖像提示詞 | Stable Diffusion/Midjourney 提示詞 |
| 🎥 動態分鏡提示詞 | Runway/Pika 動態影片提示詞 |

### 版本歷史

- 每次 AI 生成自動保存版本
- 可比較不同版本差異
- 一鍵還原歷史版本

### 匯出功能

- **PDF** - 劇本格式匯出
- **Word** - 可編輯文檔
- **Excel** - 分鏡表格
- **ZIP** - 完整專案打包

---

## 快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| Ctrl+S | 保存 |
| Ctrl+G | AI 生成 |
| Ctrl+H | 版本歷史 |
| Ctrl+Shift+←/→ | 階段切換 |
| ESC | 關閉彈窗 |

---

## 常見問題

### AI 生成失敗？
1. 檢查 API Key 是否正確
2. 確認 Base URL 格式
3. 點擊「測試連接」驗證

### 匯出 PDF 中文亂碼？
確保後端 `static/fonts/` 目錄有 `NotoSansTC-Regular.ttf` 字體檔案。
