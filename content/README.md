# Course input

將講師原始 PDF 命名為 `handout.pdf` 放在此目錄，再於專案根目錄執行：

```bash
npm run course:import -- --pdf content/handout.pdf
```

原始 PDF 不會被改寫。課程 Manifest 會建立在專案根目錄，頁面資產則建立於 `site/public/courses/<course-id>/`。

不要把 `content/handout.pdf` 提交到 Git。第一次體驗可使用：

```bash
cp examples/paper-lab-demo.pdf content/handout.pdf
```
