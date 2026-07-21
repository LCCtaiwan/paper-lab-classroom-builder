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

本機 D1／R2 binding 由 vinext／Wrangler 提供。正式環境必須設定高熵 `PILOT_INVITE_CODE`。Web Builder 不使用模型 API；上傳 PDF 後可匯入 Codex／Claude Code 的 Manifest 草稿，或直接從單一完整段落人工調整。

公開 clone 的 `.openai/hosting.json` 只包含邏輯 `DB`／`FILES` binding，不包含任何既有 Sites project id。每位部署者都要建立自己的資源。

## Shared course commands

請優先在專案根目錄執行 `npm run course:import`、`course:validate`、`course:review`、`course:preview` 與 `course:export`。完整教師流程與邊界見根目錄 `CLAUDE.md`。

Agent 草稿完成後：

```bash
npm run course:review -- --pdf content/handout.pdf
npm run dev
```

開啟 `http://localhost:3000/build?draft=local`，由教師逐頁確認後建立課堂。
