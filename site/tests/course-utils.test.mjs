import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectPdf, MAX_PDF_BYTES } from "../scripts/course-utils.mjs";

function withTempFile(name, contents, run) {
  const directory = mkdtempSync(join(tmpdir(), "paper-lab-pdf-"));
  const file = join(directory, name);
  try {
    writeFileSync(file, contents);
    run(file);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("rejects an empty PDF", () => {
  withTempFile("empty.pdf", Buffer.alloc(0), (file) => {
    assert.throws(() => inspectPdf(file), /1 byte–20 MB/);
  });
});

test("rejects a file without a PDF header", () => {
  withTempFile("not-pdf.pdf", Buffer.from("not a pdf"), (file) => {
    assert.throws(() => inspectPdf(file), /PDF header/);
  });
});

test("rejects a corrupt PDF with a plausible header", () => {
  withTempFile("corrupt.pdf", Buffer.from("%PDF-1.7\ncorrupt"), (file) => {
    assert.throws(() => inspectPdf(file), /PDF 無法讀取/);
  });
});

test("rejects a PDF over 20 MB before parsing", () => {
  const bytes = Buffer.alloc(MAX_PDF_BYTES + 1);
  bytes.write("%PDF-");
  withTempFile("oversize.pdf", bytes, (file) => {
    assert.throws(() => inspectPdf(file), /1 byte–20 MB/);
  });
});
