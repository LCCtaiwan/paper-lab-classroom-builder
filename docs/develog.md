# Development Log

## Current Goal

實作 Paper Lab 跨 Agent 互動課堂 Pilot：教師提供 PDF、確認 AI 分段並自行設定停靠頁後，建立可重複開場的講師端、純投影頁與學生提問端。

## Stack And Run Commands

- Stack：Vinext／React／TypeScript、Cloudflare Worker、D1、R2、Drizzle、Gemini PDF analysis。
- Run commands：`npm --prefix site run dev`、`npm --prefix site run build`、`npm --prefix site test`。

## Brainstorming Summary

- 核心需求是「更換 PDF 即可重建課堂」，不是先做複雜的多課程 SaaS。
- 第一階段用資料夾與設定檔產生網站，風險最低且最容易驗證泛用性。
- 第二階段才加入線上拖放、儲存、背景工作、AI 服務與發布。
- AI 負責提出課名、段落與停靠點候選；教師負責確認與發布。
- 第一階段須用兩份不同 PDF 驗證，避免只是把既有 64 頁課程換一層包裝。
- 2026-07-18：目的重新定錨為「降低學生提問門檻並讓講師看見共同困惑」；網站與 AI 都是達成此目的的工具。
- 2026-07-18：AI 定位為內容分析助理，不產生教案、互動題或停靠點；教師完全掌握授課節奏。
- 2026-07-18：Web、Codex、Claude Code 共用 `course.manifest.json` 與同一 builder；agent 不得另寫 runtime。

## Important Project Rules

- 原始 PDF 不修改；頁序與內容須保持一致。
- 移除 runtime 中固定 64 頁、八段與固定 paper 的假設。
- AI 建議未經教師確認不得發布。
- 第一階段未通過前，不開始第二階段。
- 每個切片均須回報 `pass／revise／reject`。
- 學生全程可提問與同問；問題自動綁定當下頁碼與段落，只有講師能指定投影。
- Pilot 不加入課前導讀、正式帳號、公開自助、計費或學生投影片瀏覽。

## Completed Work

- 2026-07-18：C-001 完成初版 README、SPEC、PROGRESS、CHANGELOG 與本開發紀錄。
- 2026-07-18：定義兩階段產品邊界、課程設定檔草案、醫療教學安全原則與驗收條件。
- 2026-07-18：選定下一個最小切片為「PDF 匯入＋設定檔驅動頁數」。
- 2026-07-18：C-002 完成跨 Agent Pilot brainstorming 與 SDD，選定 64 頁講義及 16 頁 OpenEvidence PDF 作為驗證輸入。
- 2026-07-20：C-003 完成共用 Manifest、四個 CLI、Web Builder、D1／R2 儲存與講師／投影／學生三端課堂。
- 2026-07-20：使用 59 頁 `0614_運動禁藥_李承洲.pdf` 完成實際建課；建議分為五段，停靠頁為 p.11、40、50、54。
- 2026-07-20：建立 `/guide` 圖解 HTML，整合 11 張真實操作畫面；桌面與 390 px 手機版視覺檢查均 `pass`。
- 2026-07-20：修正通用 `.hidden` class 造成講師端隱藏問題完全消失的缺陷；改為只對學生隱藏並保留講師回顧。

## Current Checkpoint

C-003 自動化與產品流程已 `pass`；Sites 正式發布與實體 MacBook／外接螢幕／兩支手機彩排尚未完成，因此完整 Pilot 為 `revise`。

## Recommended Next Step

先完成 Sites 私人 Pilot 發布與正式網址 smoke test，再執行 10 分鐘實體雙螢幕＋兩支手機彩排。

## Verification Status

- 規格涵蓋目標、非目標、角色、輸入、輸出、核心流程、設定檔、兩階段範圍、安全、非功能需求、驗收、風險與待決策事項。
- C-002 規劃 artifact：`pass`。
- PDF：16、59、64 頁講義均能正確辨識頁數；59 頁運動禁藥講義首／中／末頁視覺檢查 `pass`。
- Web：59 頁、5 段、4 停靠頁課程成功建立；六碼場次、學生提問、講師指定與投影單題均 `pass`。
- Guide：桌面與 390 px 手機無水平溢位；11 張圖片成功載入；console 0 errors，artifact `pass`。
- Tooling：lint、production build、10/10 tests `pass`。
- Pilot 最終狀態：`revise`，只因 Sites 正式發布與實體彩排尚未完成。
