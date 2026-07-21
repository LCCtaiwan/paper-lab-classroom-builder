import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseManifest } from "../lib/course-manifest.mjs";
import { parseArgs, resolveArgPath } from "./course-utils.mjs";

const args = parseArgs(process.argv.slice(2));
const input = resolveArgPath(args.manifest, "../course.manifest.json");
const manifest = parseManifest(readFileSync(input, "utf8"));
const assets = resolveArgPath(args.assets, `public/courses/${manifest.courseId}`);
if (!existsSync(assets)) throw new Error(`找不到課程 assets：${assets}`);
const output = resolveArgPath(args.out, `../output/${manifest.courseId}-paper-lab.zip`);
mkdirSync(dirname(output), { recursive: true });
const staging = mkdtempSync(join(tmpdir(), "paper-lab-export-"));
try {
  cpSync(input, join(staging, "course.manifest.json"));
  cpSync(assets, join(staging, "course-assets"), { recursive: true });
  cpSync(resolveArgPath(undefined, "../docs/CLOUDFLARE.md"), join(staging, "DEPLOY.md"));
  execFileSync("zip", ["-qr", output, "course.manifest.json", "course-assets", "DEPLOY.md"], { cwd: staging, stdio: "inherit" });
} finally {
  rmSync(staging, { recursive: true, force: true });
}
console.log(`PASS 匯出完成：${output}`);
