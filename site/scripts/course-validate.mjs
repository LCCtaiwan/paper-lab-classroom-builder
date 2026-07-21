import { readFileSync } from "node:fs";
import { parseManifest } from "../lib/course-manifest.mjs";
import { parseArgs, resolveArgPath } from "./course-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const input = resolveArgPath(args.manifest, "../course.manifest.json");
const manifest = parseManifest(readFileSync(input, "utf8"));
console.log(`PASS ${manifest.courseId}: ${manifest.source.pageCount} 頁、${manifest.sections.length} 段、${manifest.checkpoints.length} 個停靠頁`);
