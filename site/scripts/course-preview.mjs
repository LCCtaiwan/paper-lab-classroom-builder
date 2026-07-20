import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseManifest } from "../lib/course-manifest.mjs";
import { parseArgs } from "./course-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const input = resolve(String(args.manifest || "../course.manifest.json"));
const manifest = parseManifest(readFileSync(input, "utf8"));
writeFileSync(resolve("public/local-course.manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`PASS 已準備本機預覽：/demo?course=${encodeURIComponent(manifest.courseId)}`);
console.log("請保持 npm run dev 執行中，並開啟 http://localhost:3000/demo");
