import test from "node:test";
import assert from "node:assert/strict";
import { createFallbackManifest, normalizeAnalysisDraft, sectionForPage, validateManifest } from "../lib/course-manifest.mjs";

const fallback = createFallbackManifest({
  courseId: "sample-course",
  title: "Sample",
  fileName: "sample.pdf",
  sha256: "a".repeat(64),
  pageCount: 16,
});

test("fallback manifest covers every page without checkpoints", () => {
  assert.equal(validateManifest(fallback).ok, true);
  assert.equal(fallback.sections[0].startPage, 1);
  assert.equal(fallback.sections[0].endPage, 16);
  assert.deepEqual(fallback.checkpoints, []);
});

test("rejects gaps, overlap, duplicate checkpoints and out-of-range pages", () => {
  const invalid = {
    ...fallback,
    sections: [
      { id: "a", title: "A", summary: "A", startPage: 1, endPage: 7, evidencePages: [1] },
      { id: "b", title: "B", summary: "B", startPage: 9, endPage: 17, evidencePages: [9] },
    ],
    checkpoints: [8, 8, 17],
  };
  const result = validateManifest(invalid);
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /startPage|endPage|checkpoints/);
});

test("accepts a legal analysis draft and maps pages to sections", () => {
  const manifest = normalizeAnalysisDraft({
    title: "兩段課程",
    sections: [
      { title: "前半", summary: "前半摘要", startPage: 1, endPage: 8, evidencePages: [1, 8] },
      { title: "後半", summary: "後半摘要", startPage: 9, endPage: 16, evidencePages: [9, 16] },
    ],
  }, fallback);
  assert.equal(manifest.sections.length, 2);
  assert.equal(sectionForPage(manifest, 12).id, "section-2");
});

test("falls back when AI draft does not cover all pages", () => {
  const manifest = normalizeAnalysisDraft({ title: "Bad", sections: [] }, fallback);
  assert.deepEqual(manifest, fallback);
});
