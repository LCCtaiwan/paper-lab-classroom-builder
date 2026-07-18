# Changelog

## Unreleased

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
