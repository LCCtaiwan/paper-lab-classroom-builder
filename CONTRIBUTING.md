# Contributing to Paper Lab

感謝協助改善 Paper Lab。請把變更維持在「PDF -> Course Manifest -> 共用 Builder -> 相同課堂 runtime」這條主線。

## 開發環境

- Node.js 22.13+
- Poppler：`pdfinfo`、`pdftoppm`
- zip

安裝與驗證：

```bash
npm --prefix site ci
npm run lint
npm test
npm run release:check
```

## Pull request 原則

- 一個 PR 解決一個明確問題。
- 課名、頁數、段落與停靠頁不得寫死在 runtime。
- Agent 只能修改 Manifest 草稿；停靠頁與發布動作由教師確認。
- 不得加入模型 API 作為 Web Builder 必要依賴。
- 新功能須補測試與 `docs/develog.md` 驗證證據。
- Commit 使用 `C-### type: concise summary`。

## 教材與隱私

請勿提交真實病人資料、未授權講義、私人 PDF、課程 token、邀請碼、`.env` 或個人 Sites project id。測試素材應使用 `examples/paper-lab-demo.pdf` 或其他明確可再散布內容。

## Artifact gate

視覺、PDF、醫療教育或生成內容必須先回報 `pass`、`revise` 或 `reject`。未通過的 artifact 不得整合進 runtime。
