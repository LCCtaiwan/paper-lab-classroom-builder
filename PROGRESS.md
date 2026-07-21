# Progress

## Current Status

`C-006` — 2026-07-21 — 已移除 Sites 的 ChatGPT 登入門檻；未登入使用者可直接開啟 Pilot，建課仍由 production 邀請碼保護。

## In Progress

- 完成公開網址的 Web Builder 視覺化雙入口彩排。
- 安排 MacBook、外接螢幕與兩支手機的 10 分鐘實體彩排。

## Next

1. 以正式 Builder 視覺化重跑 Agent 草稿與人工分段入口。
2. 完成 MacBook、外接螢幕與兩支手機的 10 分鐘彩排。
3. 彩排通過後將完整 Pilot gate 標記 `pass`。

## Notes

- Pilot 只以邀請碼與秘密管理連結服務 2–5 位教師，不建立正式帳號系統。
- Codex／Claude Code 只提出課名、連續分段、摘要與頁碼依據；停靠頁完全由教師設定。
- Web standalone 不使用 Gemini 或其他模型 API，從單一完整段落開始人工調整。
- 圖解操作教學位於 `/guide`，使用 59 頁運動禁藥講義的 11 張真實產品畫面。
- C-004 驗證：lint、production build、11/11 tests；59 頁 Agent 草稿與人工 fallback；390 px 無水平溢位、59 張縮圖載入、console 0 errors。
- C-005 驗證：私人 Sites version 1 發布成功；1 頁正式環境 smoke course 完成 D1／R2 建課、六碼場次、提問、同問防重複、指定／收回投影及關閉場次；四端頁面 HTTP 200。
- C-006 驗證：無 Sites bypass token、未登入的首頁請求直接回傳 Paper Lab，HTTP 200；未出現 ChatGPT sign-in gate；未附邀請碼的建課請求仍被拒絕。
