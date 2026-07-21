# Security Policy

## Supported version

目前只維護最新的 `main` 與最新 release。

## Reporting a vulnerability

請使用 GitHub repository 的 Security -> Report a vulnerability 私下回報。不要在公開 Issue 張貼邀請碼、管理連結、講師 token、學生資料、PDF 或可重現私人課程的內容。

回報請包含：

- 受影響版本或 commit。
- 最小重現步驟。
- 預期與實際結果。
- 已隱去秘密與個資的證據。

## Deployment responsibilities

每個部署者負責自己的 Cloudflare／Sites 帳號、D1、R2、邀請碼、保存政策與教材授權。正式環境必須設定至少 12 字元的 `PILOT_INVITE_CODE`；課程管理與講師秘密連結不得分享給學生。

這是 Pilot 軟體，不提供正式醫療資訊安全、帳號生命週期、組織稽核或法規遵循保證。

## Known dependency advisory

2026-07-21 的 `npm audit --omit=dev` 回報 Next.js 內嵌 PostCSS 的 2 個 moderate advisories；目前建議的自動修正會降級至不相容的 Next.js 版本，因此 C-007 不套用 `npm audit fix --force`。Paper Lab 的 CSS 來自 repository，不接受使用者輸入，但部署者仍應在相依套件提供相容修正後更新並重跑 build、tests 與 audit。
