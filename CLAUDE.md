# Paper Lab Claude Code Instructions

## 目的

將 `content/handout.pdf` 轉成與 Web Builder、Codex 共用的 Paper Lab 課程。唯一課程真相來源是根目錄的 `course.manifest.json`；網站頁序、段落、停靠頁與品牌都由 Manifest 決定。

## 允許範圍

- 可執行本文列出的五個 `npm run course:*` 指令。
- 可讀取 PDF、產生頁面資產，並修改 `course.manifest.json`。
- 可把建議的 `title`、`sections` 與 `branding` 寫入草稿 Manifest，交由 Web Builder 讓教師確認。
- `checkpoints` 只能由教師在 Web Builder 設定，或在教師明確指定頁碼後修改。
- 不可把課名、頁數、段落、停靠頁或特定 paper 直接寫入 `site/app`、`site/lib` 或 runtime。
- 不可改寫、裁切或覆蓋原始 PDF。
- 不可替教師產生教案、互動題或自動決定停靠頁。
- 未獲教師同意，不得部署、發布或把 PDF 傳給外部 AI。

## 標準工作流

1. 確認 `content/handout.pdf` 存在；先詢問教師教材是否含病人個資或其他敏感資訊。
2. 執行：

   ```bash
   npm run course:import -- --pdf content/handout.pdf
   ```

3. 讀取 `course.manifest.json` 與縮圖，只把「課名、連續段落、每段摘要與頁碼依據」寫入草稿。不得提出教案、題目或停靠頁。
4. 草稿不得視為教師已確認；`checkpoints` 保持空白。
5. 每次修改後執行：

   ```bash
   npm run course:validate
   ```

6. 驗證通過後執行：

   ```bash
   npm run course:review -- --pdf content/handout.pdf
   ```

7. 啟動 `npm run dev` 並開啟 `http://localhost:3000/build?draft=local`，請教師在 Web Builder 檢查首頁、代表性中間頁與末頁，修改分段並自行設定停靠頁。未按下「確認並建立互動課堂」前一律標記 `revise`。
8. 教師確認後才可執行：

   ```bash
   npm run course:preview
   npm run course:export
   ```

## Artifact Gate

- `pass`：Manifest 合法且完整覆蓋 1–最後一頁；checksum 與 PDF 相符；頁面資產數量正確；教師已完成首／中／末頁視覺確認。
- `revise`：分段或摘要需修正、頁面尚未視覺確認。
- `reject`：PDF 加密、損毀、空白、超過 20 MB 或 100 頁，或 checksum／資產頁數不一致。

Agent 不分析時保留匯入程序建立的單一完整段落，交由教師人工調整；不可呼叫 Gemini、另建網站或建立另一套 schema。
