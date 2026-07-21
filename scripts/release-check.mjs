import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root })
  .toString()
  .split("\0")
  .filter(Boolean);

const errors = [];
const required = [
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CLAUDE.md",
  "docs/ARCHITECTURE.md",
  "docs/CLOUDFLARE.md",
  "docs/OPEN_SOURCE.md",
  "examples/paper-lab-demo.pdf",
  "site/.env.example",
  "site/.openai/hosting.json",
];

for (const file of required) {
  if (!existsSync(resolve(root, file))) errors.push(`缺少公開包必要檔案：${file}`);
}

const forbiddenTracked = [
  /^content\/.*\.pdf$/i,
  /^course\.manifest\.json$/i,
  /^site\/public\/local-course\./i,
  /^site\/public\/courses\//i,
  /^site\/public\/guide\/.*\.(png|jpe?g|webp)$/i,
  /^site\/\.openai\/hosting\.private\.json$/i,
  /(^|\/)\.env(?:\.|$)/i,
];

for (const file of tracked) {
  if (forbiddenTracked.some((pattern) => pattern.test(file)) && file !== "site/.env.example") {
    errors.push(`不應追蹤的公開檔案：${file}`);
  }
}

const textExtensions = new Set(["", ".cjs", ".css", ".html", ".js", ".json", ".jsonc", ".md", ".mjs", ".py", ".sql", ".ts", ".tsx", ".txt", ".yml", ".yaml"]);
const privatePatterns = [
  { pattern: /appgprj_[a-z0-9]+/i, label: "個人 Sites project id" },
  { pattern: /paperlab-[a-f0-9]{24,}/i, label: "可能的 production 邀請碼" },
  { pattern: /\/Users\/[A-Za-z0-9._-]+\//, label: "本機使用者絕對路徑" },
  { pattern: /0614_運動禁藥_李承洲|運動禁藥知多少|OpenEvidence/i, label: "私人或第三方示範教材識別" },
];

for (const file of tracked) {
  if (file === "scripts/release-check.mjs") continue;
  if (!textExtensions.has(extname(file).toLowerCase())) continue;
  const absolute = resolve(root, file);
  if (!existsSync(absolute)) continue;
  const text = readFileSync(absolute, "utf8");
  for (const { pattern, label } of privatePatterns) {
    if (pattern.test(text)) errors.push(`${file} 包含${label}`);
  }
}

const hostingPath = resolve(root, "site/.openai/hosting.json");
if (existsSync(hostingPath)) {
  const hosting = JSON.parse(readFileSync(hostingPath, "utf8"));
  if ("project_id" in hosting) errors.push("site/.openai/hosting.json 不得包含 project_id");
  if (hosting.d1 !== "DB" || hosting.r2 !== "FILES") errors.push("hosting.json 必須保留 DB／FILES 邏輯 binding");
}

if (errors.length) {
  console.error(errors.map((error) => `FAIL ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS open-source release check: ${tracked.length} tracked files scanned`);
}
