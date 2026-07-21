import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

export const MAX_PDF_BYTES = 20 * 1024 * 1024;
export const MAX_PDF_PAGES = 100;

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
    args[key] = value;
  }
  return args;
}

export function resolveArgPath(value, fallback) {
  const supplied = value !== undefined && value !== null && value !== false;
  const raw = String(supplied ? value : fallback);
  return resolve(supplied && process.env.INIT_CWD ? process.env.INIT_CWD : process.cwd(), raw);
}

export function inspectPdf(pdfPath) {
  const absolute = resolve(pdfPath);
  if (!existsSync(absolute)) throw new Error(`找不到 PDF：${absolute}`);
  const bytes = readFileSync(absolute);
  if (bytes.length === 0 || bytes.length > MAX_PDF_BYTES) throw new Error("PDF 必須介於 1 byte–20 MB。");
  if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("檔案缺少 PDF header。");
  let info;
  try {
    info = execFileSync("pdfinfo", [absolute], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    throw new Error(`PDF 無法讀取：${error?.stderr?.toString().trim() || error.message}`);
  }
  const pageCount = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
  const encrypted = info.match(/^Encrypted:\s+(\w+)/m)?.[1]?.toLowerCase() === "yes";
  if (encrypted) throw new Error("PDF 已加密，請先解除密碼保護。");
  if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PDF_PAGES) throw new Error("PDF 頁數必須介於 1–100 頁。");
  return { absolute, bytes, pageCount, sha256: createHash("sha256").update(bytes).digest("hex") };
}

function normalizeGeneratedFiles(directory, prefix, pageCount) {
  const files = readdirSync(directory).filter((name) => name.startsWith(`${prefix}-`) && /\.jpg$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length !== pageCount) throw new Error(`預期 ${pageCount} 張頁面影像，實際產生 ${files.length} 張。`);
  files.forEach((name, index) => {
    const target = `${prefix}-${String(index + 1).padStart(3, "0")}.jpg`;
    if (name !== target) renameSync(join(directory, name), join(directory, target));
  });
}

export function renderPdfAssets(pdfPath, assetsRoot, pageCount) {
  const root = resolve(assetsRoot);
  const pages = join(root, "pages");
  const thumbs = join(root, "thumbs");
  rmSync(root, { recursive: true, force: true });
  mkdirSync(pages, { recursive: true });
  mkdirSync(thumbs, { recursive: true });
  execFileSync("pdftoppm", ["-jpeg", "-r", "160", "-jpegopt", "quality=88,progressive=y,optimize=y", resolve(pdfPath), join(pages, "page")], { stdio: "inherit" });
  execFileSync("pdftoppm", ["-jpeg", "-scale-to-x", "360", "-scale-to-y", "-1", "-jpegopt", "quality=78,progressive=y,optimize=y", resolve(pdfPath), join(thumbs, "thumb")], { stdio: "inherit" });
  normalizeGeneratedFiles(pages, "page", pageCount);
  normalizeGeneratedFiles(thumbs, "thumb", pageCount);
  copyFileSync(resolve(pdfPath), join(root, "source.pdf"));
  return root;
}

export function defaultTitle(pdfPath) {
  return basename(pdfPath, extname(pdfPath)).replace(/[-_]+/g, " ").trim() || "未命名課程";
}

export function ensureParent(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}
