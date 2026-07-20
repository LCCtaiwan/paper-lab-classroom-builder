# Paper Lab runtime

Paper Lab 的共用 Web Builder 與課堂 runtime。Web、Codex 與 Claude Code 共用 `lib/course-manifest.mjs`，不在 UI 寫死課程頁數或段落。

## Local development

需要 Node.js `>=22.13.0`、Poppler（`pdfinfo`、`pdftoppm`）與 zip。

```bash
npm install
cp .env.example .env.local
npm run dev
npm run lint
npm test
```

本機 D1／R2 binding 由 vinext／Wrangler 提供。正式環境必須設定高熵 `PILOT_INVITE_CODE`；`GEMINI_API_KEY` 未設定或請求失敗時會回到單一段落人工模式。

## Shared course commands

請優先在專案根目錄執行 `npm run course:import`、`course:validate`、`course:preview` 與 `course:export`。完整教師流程與邊界見根目錄 `CLAUDE.md`。
