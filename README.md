# Paper Lab Classroom Builder

把教師原本的 PDF 講義轉成可授課的互動課堂：講師後台、外接投影、學生六碼加入、提問、同問與講師指定單題投影。

核心資料流：

```text
PDF -> Course Manifest -> shared Builder -> same classroom runtime
```

Web、Codex 與 Claude Code 都使用同一份 Manifest 和 runtime。Agent 只協助課名與連續內容分段；停靠頁、畫面確認與建立課程仍由教師決定。

## Try the public Pilot

<https://paper-lab-classroom-pilot.pharmacist-lee.chatgpt.site>

網站不需要 ChatGPT 登入。學生使用每場六碼加入；建立新課程仍需要部署者提供的 Pilot 邀請碼。

## 10-minute Quick Start

需要 Node.js 22.13+、Poppler（`pdfinfo`、`pdftoppm`）與 zip。

```bash
git clone <your-repository-url>
cd paper-lab-classroom-builder
npm --prefix site ci
cp site/.env.example site/.env.local
cp examples/paper-lab-demo.pdf content/handout.pdf
npm run course:import -- --pdf content/handout.pdf
npm run course:validate
npm run course:review -- --pdf content/handout.pdf
npm run dev
```

開啟 <http://localhost:3000/build?draft=local>。合成 demo 應顯示 3 頁；教師可把 p.3 切成第二段並自行設為停靠頁。

若只想人工分段，直接開啟 <http://localhost:3000/build>，上傳 PDF 後從單一完整段落開始。

## Three supported paths

### Web only

1. 開啟 `/build`。
2. 輸入部署者提供的邀請碼並上傳 PDF。
3. 人工拆分、命名段落與設定停靠頁。
4. 檢查第一頁、代表性中間頁與最後一頁。
5. 建立課程與六碼場次。

Web Builder 不呼叫 Gemini 或其他模型 API。

### Codex

把 PDF 放在 `content/handout.pdf`，請 Codex 依 `SPEC.md`、`docs/SDD.md` 與共用命令產生 Manifest 草稿。Codex 不得把課程內容寫進 runtime，也不得自動設定停靠頁。

### Claude Code

在 repository 根目錄啟動 Claude Code，說：

> 用 content/handout.pdf 建立 Paper Lab 課堂。依 CLAUDE.md 操作，只提出課名與連續內容分段，不要設定停靠頁。

Claude Code 會執行相同的 import、validate、review 與 Web Builder 教師確認流程。它不需要 Codex Sites；可保留本機使用，或部署到自己的 Cloudflare Workers。

## Shared commands

| Command | Purpose |
| --- | --- |
| `npm run course:import -- --pdf content/handout.pdf` | 驗證 PDF、建立 fallback Manifest 與頁面資產 |
| `npm run course:validate` | 驗證 Manifest schema 與連續頁面覆蓋 |
| `npm run course:review -- --pdf content/handout.pdf` | 準備 `/build?draft=local` 教師審查 |
| `npm run course:preview` | 準備本機 demo |
| `npm run course:export` | 匯出 Manifest、PDF 衍生資產與部署說明 |
| `npm run release:check` | 檢查公開包是否含 secrets、私人教材或個人部署 ID |

## Cloudflare deployment

此專案使用 Cloudflare Workers、D1 與 R2。Claude Code fallback：

```bash
cd site
npm ci
npx wrangler login
npx wrangler secret put PILOT_INVITE_CODE
npm run deploy:cloudflare
```

完整說明見 [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md)。每個 clone 必須建立自己的 D1、R2、網址與邀請碼，不會共用維護者資料。

## Open-source safety

- License：MIT。
- 合成 demo：[examples/paper-lab-demo.pdf](examples/paper-lab-demo.pdf)。
- 不提交 `.env`、邀請碼、token、私人 PDF、生成課程 assets 或個人 Sites project id。
- 使用自己的教材前，確認著作權與敏感資料處理權限。
- 學生端持續提醒不得輸入病人個資。

公開流程與檢查清單見 [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md)，架構見 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)，Claude Code 邊界見 [CLAUDE.md](CLAUDE.md)。

## Project status

目前是 Pilot。自動化、跨 Agent Manifest、正式 runtime 與公開存取已驗證；完整 Pilot 仍需正式 Builder 雙入口與實體雙螢幕／兩支手機彩排。進度見 [PROGRESS.md](PROGRESS.md)。

## Contributing and security

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE](LICENSE)

請勿在公開 Issue 附上私人 PDF、病人資料、邀請碼或秘密管理連結。
