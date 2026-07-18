# SDD：Paper Lab 跨 Agent 互動課堂 Pilot

## 1. Purpose

教師沿用原始講義 PDF 建立互動課堂；學生全程以暱稱提問與同問，講師在自行設定的停靠頁整理共同困惑。AI 只分析內容結構，教師保有教學決定權。

## 2. Architecture

```text
PDF ──> import/validation ──> Course Manifest ──> shared runtime
 │                                  │                ├─ host
 ├─ Web Builder + Gemini            │                ├─ display
 └─ Claude Code / Codex CLI ────────┘                └─ join

D1: course/session/question/reaction metadata
R2: source PDF, slide images, thumbnails, exports
```

Web 與 CLI 必須共用同一 validator 與 runtime。AI 回覆只是 Manifest 草稿，不得直接寫入課堂程式。

## 3. Course Manifest

```json
{
  "schemaVersion": 1,
  "courseId": "example-course",
  "title": "課程名稱",
  "source": {
    "fileName": "handout.pdf",
    "sha256": "hex digest",
    "pageCount": 16
  },
  "sections": [
    {
      "id": "section-1",
      "title": "段落名稱",
      "summary": "內容摘要",
      "startPage": 1,
      "endPage": 8,
      "evidencePages": [1, 8]
    }
  ],
  "checkpoints": [8],
  "branding": {
    "name": "Paper Lab",
    "accent": "#d97706"
  }
}
```

Validation rules：頁碼從 1 開始；sections 依序、無重疊、無缺頁並完整覆蓋 PDF；checkpoint 必須唯一且位於有效頁面；checksum 為 64 位小寫十六進位；runtime 不得另有固定頁數或段落來源。

## 4. PDF Pipeline

1. 驗證檔案存在、PDF header、大小不超過 20 MB、未加密、頁數 1–100。
2. 計算 SHA-256，不修改原 PDF。
3. 以 Poppler CLI 路徑產生投影片影像與縮圖；Web 路徑使用瀏覽器 PDF renderer，再上傳相同命名的資產。
4. 產生單一預設段落 Manifest；AI 成功時以合法分段取代，失敗時保留人工 fallback。
5. 教師視覺檢查首／中／末頁後明確確認。

## 5. Runtime Data Flow

- Course 保存 Manifest 與 asset prefix；CourseSession 保存六碼、講師 token、目前頁面、指定問題及狀態。
- 學生送出問題時由伺服器讀取場次目前頁面與 Manifest，自動寫入 page number 與 section id。
- 每個 client id 對同一問題最多一個 reaction。
- 講師 token 只以 hash 保存；管理操作使用 Authorization header。
- 同一瀏覽器的 host/display 使用 BroadcastChannel 即時同步，D1 輪詢作為跨裝置與斷線備援。

## 6. Interfaces

- `npm run course:import -- --pdf content/handout.pdf`
- `npm run course:validate`
- `npm run course:preview`
- `npm run course:export`
- Web 可匯入／匯出相同 Manifest；Claude Code 依根目錄 `CLAUDE.md` 執行上述命令。

## 7. Failure Modes

- Gemini key 缺少、超額、逾時或 schema 錯誤：顯示原因並保留單一段落人工模式。
- PDF 加密、損毀、零頁或超限：停止建立，指出檔案原因。
- Manifest 缺頁、重疊或越界：拒絕確認與匯出。
- D1／R2 unavailable：阻止寫入但保留本機 Manifest 下載。
- 進行中場次：禁止修改課程結構。

## 8. Acceptance

- 64 頁與 16 頁 PDF 均可產生相同頁數資產與合法 Manifest，checksum 不變。
- 同一 Manifest 經 Web／CLI 進入相同 runtime，課名、頁數、段落與停靠頁一致。
- 講師、投影、學生端完成翻頁、同步、提問、同問、隱藏、指定投影與課後回顧。
- build、lint、migration、測試與 10 分鐘實機彩排通過後，Pilot 才可標記 `pass`。
