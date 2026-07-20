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
