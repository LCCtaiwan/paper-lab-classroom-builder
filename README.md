# Paper Lab Classroom Builder

將教師提供的講義 PDF 轉換成可直接授課的 Paper Lab 課堂網站：MacBook 講師後台、外接純投影頁、學生提問端、課堂代碼與 QR code。

## 目標使用者

- PGY、醫療與實證醫學課程教師。
- 希望沿用原講義、不重新製作投影片，但需要降低學生提問門檻的授課者。

## 最小流程

```text
上傳講義 PDF
→ 自動轉為逐頁投影片
→ AI 建議課名與內容分段
→ 教師確認分段並自行設定停靠頁
→ 產生講師端＋投影端＋學生提問端
→ 建立可重複使用的課程與獨立場次
```

## 開發階段

1. Pilot：2–5 位教師使用的 Web Builder，加上 Codex／Claude Code 共用的 Manifest 與 CLI。
2. 正式化：帳號、公開自助、配額、保存政策、成本控制與規模化發布。

目前進入 Pilot 驗收。64 頁既有講義、16 頁 OpenEvidence PDF 與 59 頁運動禁藥講義均已通過自動化或產品流程驗證；最後仍需完成實體雙螢幕與兩支手機彩排。

## 重要文件

- [SPEC.md](SPEC.md)：產品需求、資料結構、範圍與驗收條件。
- [PROGRESS.md](PROGRESS.md)：目前狀態與下一步。
- [CHANGELOG.md](CHANGELOG.md)：有意義的變更紀錄。
- [docs/develog.md](docs/develog.md)：決策、假設與驗證歷程。
- `/guide`：以 59 頁運動禁藥講義實際操作的圖解教學頁。
