import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("build contains the Paper Lab product entry", async () => {
  const [page, layout, worker] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../dist/server/index.js", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /Paper Lab/);
  assert.match(page, /把 PDF 變成互動課堂/);
  assert.match(page, /共同困惑/);
  assert.match(page, /Web、Codex 或 Claude Code/);
  assert.doesNotMatch(page, /Your site is taking shape|react-loading-skeleton/);
  assert.ok(worker.length > 1_000, "production worker was not generated");
});

test("runtime course behavior is driven by the manifest", async () => {
  const files = ["../app/host/[code]/HostApp.tsx", "../app/display/[code]/DisplayApp.tsx", "../app/join/JoinApp.tsx"];
  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.match(source, /manifest/);
    assert.doesNotMatch(source, /\bpageCount\s*=\s*64\b|Array\(64\)|\/\s*64\b/);
  }
});

test("builder supports agent drafts and teacher-authored segmentation without Gemini", async () => {
  const [builder, viteConfig, envExample] = await Promise.all([
    readFile(new URL("../app/build/BuilderApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);
  assert.match(builder, /匯入 Agent 草稿/);
  assert.match(builder, /直接人工分段/);
  assert.match(builder, /build\?draft=local|draft"\) !== "local"/);
  assert.doesNotMatch(`${builder}\n${viteConfig}\n${envExample}`, /GEMINI|generativelanguage|\/api\/analyze/);
});

test("course review verifies PDF identity before preparing local artifacts", async () => {
  const [reviewScript, rootPackage, sitePackage] = await Promise.all([
    readFile(new URL("../scripts/course-review.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../package.json", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(reviewScript, /manifest\.source\.sha256 !== inspected\.sha256/);
  assert.match(reviewScript, /manifest\.source\.pageCount !== inspected\.pageCount/);
  assert.match(reviewScript, /local-course\.manifest\.json/);
  assert.match(reviewScript, /local-course\.pdf/);
  assert.match(rootPackage, /course:review/);
  assert.match(sitePackage, /course-review\.mjs/);
});
