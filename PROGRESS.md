# Progress

## Current Status

`C-002` — 2026-07-18 — 完成跨 Agent Pilot 決策與 SDD，開始實作共用 Manifest、Web Builder 與課堂 runtime。

## In Progress

- 建立 `course.manifest.json` schema、PDF CLI 與兩份 PDF fixture。
- 將既有 Paper Lab runtime 泛用化為課程／場次資料驅動。

## Next

1. 完成 Manifest schema、PDF 匯入／驗證／預覽／匯出命令。
2. 完成 Web Builder 的 PDF 上傳、分段審查與停靠頁設定。
3. 完成講師端、投影端、學生端與 D1／R2 資料流。
4. 驗證 Claude Code 與 Web 使用相同 Manifest 與 builder。
5. 使用兩份不同 PDF 進行 `pass／revise／reject` 驗收並發布 Pilot。

## Notes

- Pilot 只以邀請碼與秘密管理連結服務 2–5 位教師，不建立正式帳號系統。
- AI 只提出課名、連續分段、摘要與頁碼依據；停靠頁完全由教師設定。
