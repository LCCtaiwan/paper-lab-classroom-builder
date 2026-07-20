import { writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createFallbackManifest, safeCourseId } from "../lib/course-manifest.mjs";
import { defaultTitle, ensureParent, inspectPdf, parseArgs, renderPdfAssets } from "./course-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const pdf = String(args.pdf || "../content/handout.pdf");
const inspected = inspectPdf(pdf);
const courseId = safeCourseId(args.id || defaultTitle(pdf));
const output = resolve(String(args.out || "../course.manifest.json"));
const assets = resolve(String(args.assets || `public/courses/${courseId}`));

renderPdfAssets(inspected.absolute, assets, inspected.pageCount);
const manifest = createFallbackManifest({
  courseId,
  title: String(args.title || defaultTitle(pdf)),
  fileName: basename(pdf),
  sha256: inspected.sha256,
  pageCount: inspected.pageCount,
});
ensureParent(output);
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`PASS ${manifest.title}: ${manifest.source.pageCount} 頁`);
console.log(`Manifest: ${output}`);
console.log(`Assets: ${assets}`);
