# Progress

## Current Status

`C-007` — 2026-07-21 — Open-source packaging 已完成本地 artifact；專案已可作為不含個人部署識別、私人教材或 secrets 的 GitHub Template-ready 專案。

## In Progress

- 等待使用者確認 repository 名稱、MIT License 與公開 GitHub visibility。
- 正式 Builder 雙入口及實體設備 Pilot 彩排仍屬後續驗收。

## Next

1. 使用者確認 License、公開內容與 GitHub repository 名稱。
2. 獲得明確核准後建立公開 GitHub Template repository。
3. 公開後勾選 Template repository，完成 clone smoke test 並建立 `v0.1.0` tag。
4. 另行完成正式 Builder 與實體設備 Pilot 彩排。

## Notes

- Pilot 只以邀請碼與秘密管理連結服務 2–5 位教師，不建立正式帳號系統。
- Codex／Claude Code 只提出課名、連續分段、摘要與頁碼依據；停靠頁完全由教師設定。
- Web standalone 不使用 Gemini 或其他模型 API，從單一完整段落開始人工調整。
- 圖解操作教學位於 `/guide`，公開包只使用 3 頁合成 demo 與文字／CSS 示意畫面。
- C-004 驗證：lint、production build、11/11 tests；內部授權講義的 Agent 草稿與人工 fallback；390 px 無水平溢位、所有縮圖載入、console 0 errors。
- C-005 驗證：私人 Sites version 1 發布成功；1 頁正式環境 smoke course 完成 D1／R2 建課、六碼場次、提問、同問防重複、指定／收回投影及關閉場次；四端頁面 HTTP 200。
- C-006 驗證：無 Sites bypass token、未登入的首頁請求直接回傳 Paper Lab，HTTP 200；未出現 ChatGPT sign-in gate；未附邀請碼的建課請求仍被拒絕。
- C-007 驗證：MIT 開源包、3 頁合成 demo、公開文件與 release check 完成；lint、production build、13/13 tests、桌面／390 px guide 與乾淨匯出副本 Quick Start 均 `pass`。
- C-007 dependency audit：production 無 high／critical；Next.js 內嵌 PostCSS 保留 2 個 moderate advisories，原因與更新策略記錄於 `SECURITY.md`。
