# Changelog

## Unreleased

### C-006 — 2026-07-21

- Changed：將 Sites 存取模式改為公開網址，移除 ChatGPT 登入門檻。
- Preserved：建立課程 API 仍要求 production `PILOT_INVITE_CODE`；課程管理與講師操作仍使用秘密 token。
- Why：讓沒有 ChatGPT 帳號的講師與學生也能直接使用 Pilot。
- Verified：未登入、未帶 Sites bypass token 的首頁請求回傳 Paper Lab，HTTP 200，未進入 sign-in gate；未附邀請碼的建課請求仍被拒絕。
- Gate：公開存取設定 `pass`；完整 Pilot 仍待正式 Builder 視覺雙入口與實體設備彩排。

### C-005 — 2026-07-21

- Added：發布擁有者限定的 Sites 私人 Pilot，並在託管端以秘密保存 production `PILOT_INVITE_CODE`。
- Added：啟用 Sites 管理的 D1／R2，保存課程、場次、問題、同問、原 PDF、頁面與縮圖。
- Verified：production build、11/11 tests；正式網址完成建課、六碼場次、提問、同問防重複、指定／收回投影與四端 HTTP 200 smoke test。
- Gate：部署與 runtime smoke `pass`；完整 Pilot 因擁有者登入後的 Builder 視覺彩排及實體雙螢幕／兩支手機彩排維持 `revise`。

### C-004 — 2026-07-21

- Changed：將分段入口改為 Codex／Claude Code 草稿或教師人工分段，Web Builder 不再依賴 Gemini API。
- Added：完成 `course:review` 本機審查流程，驗證 PDF checksum／頁數後把 Agent 草稿交由 `/build?draft=local` 逐頁確認。
- Changed：Web Builder 顯示「匯入 Agent 草稿」與「直接人工分段」；移除 Gemini route、key、model、consent 與分析按鈕。
- Changed：更新 `/guide` 前四張真實截圖與說明，使操作文件符合 Agent 草稿／人工雙入口。
- Why：讓講師直接使用既有 Agent 或完全自行分段，減少額外 API key、資料政策與模型供應商依賴。
- Verified：lint、production build、11/11 tests；59 頁實際講義的 5 段 Agent 草稿與單一段落人工 fallback 均通過；手機 390 px 無溢位、59 張縮圖完整、console 0 errors。
- Gate：C-004 artifact `pass`；完整 Pilot 仍因正式部署與實體彩排維持 `revise`。

### C-003 — 2026-07-20

- Added：完成共用 Manifest validator、PDF import／validate／preview／export CLI 與根目錄 `CLAUDE.md`。
- Added：完成 Web Builder、D1／R2 課程資料、獨立場次、六碼加入、講師／投影／學生三端、提問、同問、隱藏、指定投影與課後回顧。
- Added：建立 `/guide` 響應式 HTML，以 59 頁「運動禁藥知多少」講義的 11 張真實操作截圖說明完整流程。
- Changed：建課頁加入「操作教學」入口；社群分享 metadata 使用已驗收的 Paper Lab 圖像。
- Fixed：隱藏問題改用專用 CSS 狀態，確保學生端不可見但講師課後仍可回顧。
- Why：讓沒有 Codex／Claude 的教師也能看圖完成建課，同時保留跨 Agent 相同的課程資料契約。
- Verified：lint、production build、10/10 tests 通過；16／59 頁 Web 流程、16／64 頁 CLI、桌面與 390 px 手機教學頁通過；`/guide` 11 張圖片全部載入且 console 0 errors。
- Gate：自動化與圖解教學 artifact `pass`；完整 Pilot 因尚未完成實體雙螢幕＋兩支手機彩排，維持 `revise`。

### C-002 — 2026-07-18

- Changed：將第一階段收斂為跨 Agent Web Pilot；無 coding agent、Codex 與 Claude Code 均共用 Manifest 與 deterministic builder。
- Defined：AI 僅分析課名與連續分段；互動停靠頁由教師自行設定。
- Defined：以 D1 保存課程／場次／問題，以 R2 保存 PDF／投影片素材；pilot 採邀請碼與秘密管理連結。
- Added：建立 `docs/SDD.md`，定義資料契約、PDF 管線、Web／CLI parity、課堂同步與驗收方式。
- Why：確保 0 基礎教師不需 agent 訂閱，也能建立與 agent 路徑相同的互動課堂。
- Verified：規劃 artifact `pass`；程式與產品流程驗收仍進行中。

### C-001 — 2026-07-18

- Added：建立 Paper Lab Classroom Builder 的 README、SPEC、PROGRESS 與開發紀錄。
- Defined：將產品分為第一階段可複製課程模板產生器，以及第二階段線上課程建立器。
- Defined：以課程設定檔移除固定 64 頁、八段與固定 paper，並保留教師確認後才發布的醫療教學安全門檻。
- Why：先建立可驗證的產品邊界與驗收條件，再開始泛用化既有 Paper Lab 課堂框架。
- Verified：文件交叉檢查涵蓋目標、輸入、輸出、流程、資料結構、範圍、風險、待決策事項與兩階段驗收門檻。
