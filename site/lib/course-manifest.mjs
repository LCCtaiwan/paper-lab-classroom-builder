const HEX_64 = /^[a-f0-9]{64}$/;
const ID_PATTERN = /^[a-z][a-z0-9-]{1,62}$/;

export const MANIFEST_SCHEMA_VERSION = 1;

export function safeCourseId(value) {
  const slug = String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
  return /^[a-z]/.test(slug) ? slug : `course-${slug || "draft"}`;
}

export function createFallbackManifest({ courseId, title, fileName, sha256, pageCount }) {
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    courseId: safeCourseId(courseId),
    title: String(title || "未命名課程").trim(),
    source: { fileName, sha256, pageCount },
    sections: [
      {
        id: "section-1",
        title: "完整講義",
        summary: "AI 尚未提供合法分段，請由教師依講義內容調整。",
        startPage: 1,
        endPage: pageCount,
        evidencePages: pageCount === 1 ? [1] : [1, pageCount],
      },
    ],
    checkpoints: [],
    branding: { name: "Paper Lab", accent: "#d97706" },
  };
}

export function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return { ok: false, errors: ["Manifest 必須是 JSON object。"] };
  }
  if (manifest.schemaVersion !== MANIFEST_SCHEMA_VERSION) errors.push("schemaVersion 必須為 1。");
  if (!ID_PATTERN.test(String(manifest.courseId ?? ""))) errors.push("courseId 格式無效。");
  if (!String(manifest.title ?? "").trim()) errors.push("title 不可空白。");

  const source = manifest.source;
  const pageCount = Number(source?.pageCount);
  if (!source || typeof source !== "object") errors.push("source 不可省略。");
  if (!String(source?.fileName ?? "").toLowerCase().endsWith(".pdf")) errors.push("source.fileName 必須是 PDF。");
  if (!HEX_64.test(String(source?.sha256 ?? ""))) errors.push("source.sha256 必須是 SHA-256 hex。");
  if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > 100) errors.push("source.pageCount 必須介於 1–100。");

  if (!Array.isArray(manifest.sections) || manifest.sections.length === 0) {
    errors.push("sections 至少需要一段。");
  } else if (Number.isInteger(pageCount) && pageCount > 0) {
    let expectedStart = 1;
    const seenIds = new Set();
    manifest.sections.forEach((section, index) => {
      const label = `sections[${index}]`;
      if (!section || typeof section !== "object") {
        errors.push(`${label} 格式無效。`);
        return;
      }
      if (!String(section.id ?? "").trim() || seenIds.has(section.id)) errors.push(`${label}.id 必須存在且唯一。`);
      seenIds.add(section.id);
      if (!String(section.title ?? "").trim()) errors.push(`${label}.title 不可空白。`);
      if (!String(section.summary ?? "").trim()) errors.push(`${label}.summary 不可空白。`);
      if (section.startPage !== expectedStart) errors.push(`${label}.startPage 應為 ${expectedStart}。`);
      if (!Number.isInteger(section.endPage) || section.endPage < section.startPage || section.endPage > pageCount) {
        errors.push(`${label}.endPage 超出有效範圍。`);
      }
      if (!Array.isArray(section.evidencePages) || section.evidencePages.length === 0 || section.evidencePages.some((page) => !Number.isInteger(page) || page < section.startPage || page > section.endPage)) {
        errors.push(`${label}.evidencePages 必須落在段落頁碼內。`);
      }
      expectedStart = Number(section.endPage) + 1;
    });
    if (expectedStart !== pageCount + 1) errors.push(`sections 必須完整覆蓋第 1–${pageCount} 頁。`);
  }

  if (!Array.isArray(manifest.checkpoints)) {
    errors.push("checkpoints 必須是 array。");
  } else if (Number.isInteger(pageCount)) {
    const unique = new Set(manifest.checkpoints);
    if (unique.size !== manifest.checkpoints.length) errors.push("checkpoints 不可重複。");
    if (manifest.checkpoints.some((page) => !Number.isInteger(page) || page < 1 || page > pageCount)) errors.push("checkpoints 包含無效頁碼。");
  }

  if (!manifest.branding || typeof manifest.branding !== "object") errors.push("branding 不可省略。");
  if (!String(manifest.branding?.name ?? "").trim()) errors.push("branding.name 不可空白。");
  if (!/^#[0-9a-fA-F]{6}$/.test(String(manifest.branding?.accent ?? ""))) errors.push("branding.accent 必須為六位 hex 色碼。");
  return { ok: errors.length === 0, errors };
}

export function assertManifest(manifest) {
  const result = validateManifest(manifest);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return manifest;
}

export function parseManifest(text) {
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    throw new Error(`Manifest 不是合法 JSON：${error instanceof Error ? error.message : String(error)}`);
  }
  return assertManifest(manifest);
}

export function sectionForPage(manifest, page) {
  return manifest.sections.find((section) => page >= section.startPage && page <= section.endPage) ?? manifest.sections[0];
}

export function normalizeAnalysisDraft(draft, fallback) {
  const sections = Array.isArray(draft?.sections)
    ? draft.sections.map((section, index) => ({
        id: `section-${index + 1}`,
        title: String(section?.title ?? "").trim(),
        summary: String(section?.summary ?? "").trim(),
        startPage: Number(section?.startPage),
        endPage: Number(section?.endPage),
        evidencePages: Array.isArray(section?.evidencePages) ? section.evidencePages.map(Number) : [],
      }))
    : [];
  const candidate = {
    ...fallback,
    title: String(draft?.title ?? fallback.title).trim() || fallback.title,
    sections,
  };
  return validateManifest(candidate).ok ? candidate : fallback;
}
