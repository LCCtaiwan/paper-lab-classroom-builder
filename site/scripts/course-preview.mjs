import { readFileSync, writeFileSync } from "node:fs";
import { parseManifest } from "../lib/course-manifest.mjs";
import { parseArgs, resolveArgPath } from "./course-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const input = resolveArgPath(args.manifest, "../course.manifest.json");
const manifest = parseManifest(readFileSync(input, "utf8"));
writeFileSync(resolveArgPath(undefined, "public/local-course.manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`PASS 已準備本機預覽：/demo?course=${encodeURIComponent(manifest.courseId)}`);
console.log("請保持 npm run dev 執行中，並開啟 http://localhost:3000/demo");
