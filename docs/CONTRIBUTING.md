# 貢獻指南

感謝您對 AI 故事創作工具的貢獻！

## 開發流程

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 創建 Pull Request

## 代碼規範

### 後端 (Python)
- 使用 `black` 格式化
- 使用 `ruff` 進行 linting
- 遵循 PEP 8

```bash
black .
ruff check .
```

### 前端 (TypeScript)
- 使用 ESLint
- 遵循 Next.js 最佳實踐

```bash
npm run lint
```

## 提交訊息格式

```
<type>: <description>

[optional body]
```

常用類型：
- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔更新
- `style`: 代碼格式
- `refactor`: 重構
- `test`: 測試

## 問題回報

請使用 GitHub Issues 並提供：
- 問題描述
- 重現步驟
- 預期行為
- 截圖（如適用）
