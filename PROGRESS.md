# Progress

## Current Status

`C-005` — 2026-07-21 — Sites 私人 Pilot 發布中；production 邀請碼已存入託管端秘密，D1／R2 綁定與正式網址仍待部署驗證。

## In Progress

- 完成 Sites 私人 Pilot 版本封裝、發布與正式網址 smoke test。
- 安排 MacBook、外接螢幕與兩支手機的 10 分鐘實體彩排。

## Next

1. 建立 Cloudflare／Sites 私人版本並設定 production `PILOT_INVITE_CODE`。
2. 以正式網址重跑 Agent 草稿、人工分段、建課、開場、提問與投影 smoke test。
3. 完成實體雙螢幕與兩支手機彩排。
4. 彩排通過後將完整 Pilot gate 標記 `pass`。

## Notes

- Pilot 只以邀請碼與秘密管理連結服務 2–5 位教師，不建立正式帳號系統。
- Codex／Claude Code 只提出課名、連續分段、摘要與頁碼依據；停靠頁完全由教師設定。
- Web standalone 不使用 Gemini 或其他模型 API，從單一完整段落開始人工調整。
- 圖解操作教學位於 `/guide`，使用 59 頁運動禁藥講義的 11 張真實產品畫面。
- C-004 驗證：lint、production build、11/11 tests；59 頁 Agent 草稿與人工 fallback；390 px 無水平溢位、59 張縮圖載入、console 0 errors。
