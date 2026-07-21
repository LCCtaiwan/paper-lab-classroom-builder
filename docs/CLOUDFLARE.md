# Claude Code／Cloudflare fallback

這個 repository 本身就是等價的 Cloudflare Workers 部署包；Web 與 Claude Code 仍使用同一個 Manifest validator 與 runtime。`course:export` 另會封裝 Manifest、原 PDF 衍生資產與本說明供備份或搬移。

## 已發布的 Sites Pilot

正式 Pilot 位於 <https://paper-lab-classroom-pilot.pharmacist-lee.chatgpt.site>，不要求 ChatGPT 登入；任何取得網址的人都能開啟網站與學生頁，但建立課程仍由應用層 `PILOT_INVITE_CODE` 保護。D1 保存課程、場次、問題與同問；R2 保存 PDF、頁面與縮圖。下列 Wrangler 流程是 Claude Code 使用者無法使用 Sites 時的等價 fallback。

## Prerequisites

- Node.js 22.13+
- Cloudflare 帳號與 Wrangler 登入
- 受控試用用的高熵邀請碼

## Deploy

每個公開 clone 都會建立自己的 Cloudflare 資源。repository 內的 `site/.openai/hosting.json` 只含 `DB`／`FILES` 邏輯 binding，不含維護者的 Sites project id、D1 id 或 R2 bucket id。

```bash
cd site
npm install
npx wrangler login
printf '%s' '請替換成至少 12 字元的高熵邀請碼' | npx wrangler secret put PILOT_INVITE_CODE
npm run deploy:cloudflare
```

`vite.config.ts` 宣告 `DB`（D1）與 `FILES`（R2），建置時會產生 Wrangler deployment config；`wrangler.example.jsonc` 是需要改用靜態設定時的範本。新版 Wrangler 可在部署時依 binding 自動 provision；若帳號政策不允許自動建立，先在 Cloudflare Dashboard 建立資源，再把對應 ID／bucket name 補入靜態設定。

Schema 由 runtime 首次請求以 `CREATE TABLE IF NOT EXISTS` 建立；版本化 SQL同時保留在 `site/drizzle/`。部署完成後，仍從 `/build` 上傳 PDF 或從 Web 匯入 Claude Code 確認過的 Manifest，不得另建課程 runtime。

## Security gate

- 不可把 invite code 提交到 Git。
- 正式環境不接受預設邀請碼；未設定至少 12 字元的 `PILOT_INVITE_CODE` 時，建立課程 API 會拒絕工作。
- 課程管理與講師 token 只在資料庫保存 SHA-256 hash，原 token 只透過 Authorization header 傳送。
- Web Builder 不呼叫模型 API；教師仍須確認有權把教材上傳至自己的 Paper Lab 環境，且不含病人個資。
