import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseManifest } from "../lib/course-manifest.mjs";
import { ensureParent, inspectPdf, parseArgs } from "./course-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const manifestPath = resolve(String(args.manifest || "../course.manifest.json"));
const pdfPath = resolve(String(args.pdf || "../content/handout.pdf"));
const manifest = parseManifest(readFileSync(manifestPath, "utf8"));
const inspected = inspectPdf(pdfPath);

if (manifest.source.sha256 !== inspected.sha256) {
  throw new Error("Manifest 的 PDF checksum 與指定講義不一致。");
}
if (manifest.source.pageCount !== inspected.pageCount) {
  throw new Error("Manifest 的 PDF 頁數與指定講義不一致。");
}

const publicManifest = resolve("public/local-course.manifest.json");
const publicPdf = resolve("public/local-course.pdf");
ensureParent(publicManifest);
writeFileSync(publicManifest, `${JSON.stringify(manifest, null, 2)}\n`);
copyFileSync(inspected.absolute, publicPdf);

console.log(`PASS 已準備 Web Builder 講師審查：${manifest.title}`);
console.log(`Manifest：${publicManifest}`);
console.log(`PDF：${publicPdf}`);
console.log("請保持 npm run dev 執行中，並開啟 http://localhost:3000/build?draft=local");
