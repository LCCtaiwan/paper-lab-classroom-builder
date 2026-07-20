# Claude Code／Cloudflare fallback

這個 repository 本身就是等價的 Cloudflare Workers 部署包；Web 與 Claude Code 仍使用同一個 Manifest validator 與 runtime。`course:export` 另會封裝 Manifest、原 PDF 衍生資產與本說明供備份或搬移。

## Prerequisites

- Node.js 22.13+
- Cloudflare 帳號與 Wrangler 登入
- 受控試用用的高熵邀請碼

## Deploy

```bash
cd site
npm install
npx wrangler login
printf '%s' '請替換成至少 12 字元的高熵邀請碼' | npx wrangler secret put PILOT_INVITE_CODE
# Gemini 可省略；省略時 Web Builder 使用人工分段 fallback
printf '%s' '你的 Gemini key' | npx wrangler secret put GEMINI_API_KEY
npm run deploy:cloudflare
```

`vite.config.ts` 宣告 `DB`（D1）與 `FILES`（R2），建置時會產生 Wrangler deployment config；`wrangler.example.jsonc` 是需要改用靜態設定時的範本。新版 Wrangler 可在部署時依 binding 自動 provision；若帳號政策不允許自動建立，先在 Cloudflare Dashboard 建立資源，再把對應 ID／bucket name 補入靜態設定。

Schema 由 runtime 首次請求以 `CREATE TABLE IF NOT EXISTS` 建立；版本化 SQL同時保留在 `site/drizzle/`。部署完成後，仍從 `/build` 上傳 PDF 或從 Web 匯入 Claude Code 確認過的 Manifest，不得另建課程 runtime。

## Security gate

- 不可把 invite code 或 Gemini key 提交到 Git。
- 正式環境不接受預設邀請碼；未設定至少 12 字元的 `PILOT_INVITE_CODE` 時，建立課程 API 會拒絕工作。
- 課程管理與講師 token 只在資料庫保存 SHA-256 hash，原 token 只透過 Authorization header 傳送。
- Gemini free tier 只處理教師確認無敏感資訊的教材。
