# Synthetic demo

`paper-lab-demo.pdf` 是 Paper Lab contributors 建立的三頁合成教材，不包含病人資料、醫療建議或第三方講義內容，可依 repository 的 MIT License 複製與修改。

重新產生：

```bash
npm run demo:pdf
```

用它測試完整流程：

```bash
cp examples/paper-lab-demo.pdf content/handout.pdf
npm run course:import -- --pdf content/handout.pdf
npm run course:validate
npm run course:review -- --pdf content/handout.pdf
npm run dev
```
