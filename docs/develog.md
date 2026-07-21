# Development Log

## Current Goal

實作 C-008 GitHub Public Template Release：將已通過 C-007 的專案發布為 MIT／Public／Template repository，並以公開 URL 乾淨 clone 驗證後建立 `v0.1.0`。

## Stack And Run Commands

- Stack：Vinext／React／TypeScript、Cloudflare Worker、D1、R2、Drizzle、PDF.js／Poppler。
- Run commands：`npm --prefix site run dev`、`npm --prefix site run build`、`npm --prefix site test`。

## Brainstorming Summary

- 核心需求是「更換 PDF 即可重建課堂」，不是先做複雜的多課程 SaaS。
- 第一階段用資料夾與設定檔產生網站，風險最低且最容易驗證泛用性。
- 第二階段才加入線上拖放、儲存、背景工作、AI 服務與發布。
- AI 負責提出課名、段落與停靠點候選；教師負責確認與發布。
- 第一階段須用兩份不同 PDF 驗證，避免只是把既有 64 頁課程換一層包裝。
- 2026-07-18：目的重新定錨為「降低學生提問門檻並讓講師看見共同困惑」；網站與 AI 都是達成此目的的工具。
- 2026-07-18：AI 定位為內容分析助理，不產生教案、互動題或停靠點；教師完全掌握授課節奏。
- 2026-07-18：Web、Codex、Claude Code 共用 `course.manifest.json` 與同一 builder；agent 不得另寫 runtime。
- 2026-07-21：移除 Web Builder 內建 Gemini；Agent 使用者以草稿 Manifest 交接，沒有 Agent 的教師從單一完整段落人工調整。
- 2026-07-21：教師確認門檻統一放在 Web Builder；Agent 不得自動設定停靠頁或跳過視覺檢查。
- 2026-07-21：開源包採 MIT License；GitHub 公開動作與本地 packaging gate 分開，未明確核准前不對外發布。
- 2026-07-21：真實講義、真實講義截圖、個人 Sites project id 與所有 secrets 均排除於公開包。
- 2026-07-21：使用者核准 `paper-lab-classroom-builder`、MIT 與 Public visibility；C-008 不包含 Sites 重新部署。

## Important Project Rules

- 原始 PDF 不修改；頁序與內容須保持一致。
- 移除 runtime 中固定 64 頁、八段與固定 paper 的假設。
- Agent 草稿未經教師確認不得發布。
- 第一階段未通過前，不開始第二階段。
- 每個切片均須回報 `pass／revise／reject`。
- 學生全程可提問與同問；問題自動綁定當下頁碼與段落，只有講師能指定投影。
- Pilot 不加入課前導讀、正式帳號、公開自助、計費或學生投影片瀏覽。

## Completed Work

- 2026-07-18：C-001 完成初版 README、SPEC、PROGRESS、CHANGELOG 與本開發紀錄。
- 2026-07-18：定義兩階段產品邊界、課程設定檔草案、醫療教學安全原則與驗收條件。
- 2026-07-18：選定下一個最小切片為「PDF 匯入＋設定檔驅動頁數」。
- 2026-07-18：C-002 完成跨 Agent Pilot brainstorming 與 SDD，選定 64 頁與 16 頁兩份不同結構 PDF 作為驗證輸入。
- 2026-07-20：C-003 完成共用 Manifest、四個 CLI、Web Builder、D1／R2 儲存與講師／投影／學生三端課堂。
- 2026-07-20：使用一份經授權的 59 頁內部講義完成實際建課；建議分為五段，停靠頁為 p.11、40、50、54。
- 2026-07-20：建立 `/guide` 圖解 HTML，整合 11 張真實操作畫面；桌面與 390 px 手機版視覺檢查均 `pass`。
- 2026-07-20：修正通用 `.hidden` class 造成講師端隱藏問題完全消失的缺陷；改為只對學生隱藏並保留講師回顧。
- 2026-07-21：C-004 規格與 SDD 已同步為 Agent 草稿／教師人工分段雙入口；實作與驗證進行中。
- 2026-07-21：移除 `/api/analyze`、Gemini環境設定與 Web 分析按鈕；Web standalone 直接建立單一完整段落。
- 2026-07-21：新增 `course:review`，只有 Manifest 與 PDF checksum／頁數相符時才準備 `/build?draft=local` 審查資料。
- 2026-07-21：以 59 頁運動禁藥講義驗證 5 段 Agent 草稿、0 停靠頁起始狀態，以及教師人工從 p.12 拆分的 fallback。
- 2026-07-21：更新 `/guide` 前四張真實畫面；C-004 桌面與 390 px 手機 artifact `pass`。
- 2026-07-21：C-005 建立 Sites 私人專案並將高熵 `PILOT_INVITE_CODE` 儲存在託管端秘密；專案檔案不保存明文邀請碼。
- 2026-07-21：Sites private version 1 發布成功；正式網址為 `https://paper-lab-classroom-pilot.pharmacist-lee.chatgpt.site`。
- 2026-07-21：以 1 頁實際講義 smoke course 驗證 D1／R2、六碼場次、問題頁碼綁定、同問防重複、指定／收回投影與關閉場次。
- 2026-07-21：C-006 將 Sites access mode 改為 public；未登入、未帶 bypass token 的首頁請求直接回傳 Paper Lab，HTTP 200。
- 2026-07-21：C-007 加入 MIT License、公開 Quick Start、貢獻／安全指南、GitHub templates、架構文件與 Claude Code／Cloudflare fallback。
- 2026-07-21：建立 3 頁合成 `examples/paper-lab-demo.pdf` 與可重現產生器；首／中／末頁文字、比例與視覺檢查均 `pass`。
- 2026-07-21：從公開包移除 11 張真實教材畫面與個人 Sites project id；`/guide` 改用合成 demo 的文字／CSS 操作示意。
- 2026-07-21：新增 `release:check`，阻擋 secrets、私人教材、生成 assets、絕對本機路徑與個人部署 ID；修正 root CLI 的 PDF 路徑解析。
- 2026-07-21：建課邀請碼錯誤改為 403、production 未設定邀請碼改為 503；production build 與 13/13 tests `pass`。
- 2026-07-21：桌面與 390 px `/guide` 視覺檢查無水平溢位、無外部圖片、console 0 errors，artifact `pass`。
- 2026-07-21：乾淨 staging 匯出副本依 README 完成 `npm ci`、demo 匯入、Manifest 驗證、Web review、lint、production build、13/13 tests 與 release check，全部 `pass`。
- 2026-07-21：`npm audit --omit=dev --audit-level=high` 無 high／critical；Next.js 內嵌 PostCSS 保留 2 個 moderate advisories，自動修正會造成不相容降級，已公開記錄於 `SECURITY.md`。
- 2026-07-21：C-008 發布邊界與 sequence 已加入 SDD；GitHub CLI 現有 `LCCtaiwan` token 失效，官方 device authorization 進行中。

## Current Checkpoint

C-007 本地 artifact 與 commit `02679be` 已完成；C-008 已獲公開授權，目前等待 GitHub device authorization，尚未建立 repository。

## Recommended Next Step

完成 GitHub device authorization 後建立 Public Template repository；由公開 URL 乾淨 clone 驗證，全部 `pass` 後才建立 `v0.1.0`。

## Verification Status

- 規格涵蓋目標、非目標、角色、輸入、輸出、核心流程、設定檔、兩階段範圍、安全、非功能需求、驗收、風險與待決策事項。
- C-002 規劃 artifact：`pass`。
- PDF：16、59、64 頁講義均能正確辨識頁數；59 頁運動禁藥講義首／中／末頁視覺檢查 `pass`。
- Web：59 頁、5 段、4 停靠頁課程成功建立；六碼場次、學生提問、講師指定與投影單題均 `pass`。
- Guide：桌面與 390 px 手機無水平溢位；11 張圖片成功載入；console 0 errors，artifact `pass`。
- Tooling：lint、production build、10/10 tests `pass`。
- C-004 Tooling：lint、production build、11/11 tests `pass`。
- C-004 Agent review：59 頁、5 個連續段落、0 個 Agent 停靠頁；講師新增停靠頁及確認門檻 `pass`。
- C-004 Manual：59 頁單一完整段落，人工於 p.12 拆為兩段 `pass`。
- C-004 Mobile：390 px `scrollWidth === innerWidth`、59 張縮圖、0 張損壞、console 0 errors，artifact `pass`。
- C-005 Sites：private version 1 部署成功；production secret、D1、R2 與正式網址 smoke `pass`。
- C-005 Runtime：測試課程 ready、六碼場次、學生問題綁定 p.1／section-1、首次同問成功、重複同問被辨識、指定投影成功、四端 HTTP 200，測試場次已關閉。
- C-006 Access：Sites public mode；未登入首頁 HTTP 200 且直接載入 Paper Lab，未附邀請碼的建課請求仍被拒絕。
- C-007 Package：公開設定無 project id；無私人 PDF、真實教材截圖、secrets、生成課程 assets或本機絕對路徑，`release:check` `pass`。
- C-007 Demo：3 頁合成 PDF checksum／頁數／比例與首／中／末頁視覺檢查 `pass`。
- C-007 Tooling：lint、production build、13/13 tests；桌面與 390 px `/guide` console 0 errors、無水平溢位，artifact `pass`。
- C-007 Clean export：依 README 安裝、匯入 demo、Manifest 驗證、review、lint、production build、tests 與 release check 均 `pass`。
- C-007 Dependency audit：production 無 high／critical；2 個 moderate PostCSS advisories 已記錄，未執行破壞性 `audit fix --force`。
- Pilot 最終狀態：`revise`，只因正式 Builder 視覺雙入口與實體雙螢幕／兩支手機彩排尚未完成。
