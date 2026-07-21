# Architecture

Paper Lab 將 Agent 與課堂網站分離。Codex、Claude Code 或教師人工操作最後都只產生同一份 Course Manifest。

```text
PDF
├─ Web Builder manual segmentation
├─ Codex draft
└─ Claude Code draft
        |
        v
Course Manifest validator
        |
        v
Shared classroom runtime
├─ teacher host
├─ external display
└─ student questions

D1: courses, sessions, questions, reactions
R2: source PDF, slide images, thumbnails
```

## Trust boundaries

- 原始 PDF 不修改，checksum 用於確認內容身份。
- Agent 只能建議課名、連續分段、摘要與依據頁碼。
- 教師在 Web Builder 設定停靠頁並完成首／中／末頁視覺確認。
- 學生問題由伺服器綁定講師當下頁碼與段落。
- 邀請碼只保護建課；管理與講師操作使用高熵秘密 token。

## Portability

`site/.openai/hosting.json` 只保存 `DB` 與 `FILES` 邏輯 binding。Codex Sites 或每個 Cloudflare clone 都建立自己的實體 D1／R2，不共用維護者資料。
