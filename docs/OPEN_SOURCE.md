# Open-source Release Guide

## Local artifact first

C-007 先建立可公開的本地 artifact，不會自動建立公開 GitHub repository。公開前執行：

```bash
npm run release:check
npm run lint
npm test
```

再用乾淨匯出副本重跑 demo PDF 匯入與 Manifest 驗證。

## GitHub Template

建議 repository 名稱：`paper-lab-classroom-builder`。

公開後在 GitHub Settings 勾選 Template repository。使用者即可選擇 Use this template，建立完全獨立的 repository、Cloudflare 資源與邀請碼。

## Publication checklist

- [ ] 使用者確認 repository 名稱與 MIT License。
- [ ] `site/.openai/hosting.json` 沒有 `project_id`。
- [ ] 沒有 `.env`、token、邀請碼、私人 PDF 或生成課程 assets。
- [ ] 所有教學畫面只使用合成 demo。
- [ ] Clean clone 安裝、匯入、lint、build、tests 全部通過。
- [ ] GitHub public visibility 已由使用者明確核准。
- [ ] 通過後建立 `v0.1.0` tag。

## 45-minute Claude Code workshop

1. 0–5 分鐘：Use this template、clone、安裝依賴。
2. 5–10 分鐘：把 PDF 放入 `content/handout.pdf`。
3. 10–20 分鐘：Claude Code 依 `CLAUDE.md` 匯入、提出課名與連續分段。
4. 20–30 分鐘：教師在 Web Builder 確認分段、停靠頁與畫面。
5. 30–40 分鐘：本機建立場次並以手機提問。
6. 40–45 分鐘：選擇保留本機，或依 `docs/CLOUDFLARE.md` 部署自己的 Workers。
