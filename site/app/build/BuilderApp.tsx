"use client";

/* eslint-disable @next/next/no-img-element -- PDF pages use generated blob URLs. */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { CourseManifest, CourseSection } from "../../lib/course-manifest.mjs";
import { createFallbackManifest, safeCourseId, validateManifest } from "../../lib/course-manifest.mjs";

type PageThumb = { page: number; url: string };

async function responseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try { return JSON.parse(text) as T; }
  catch { throw new Error(text || `伺服器回應錯誤（${response.status}）。`); }
}

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("無法產生 JPEG。")), "image/jpeg", quality));
}

async function renderPage(document: PDFDocumentProxy, pageNumber: number, targetWidth: number, quality: number) {
  const page = await document.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: targetWidth / base.width });
  const canvas = window.document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("瀏覽器無法建立 PDF canvas。");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvasBlob(canvas, quality);
}

function rebuildSections(existing: CourseSection[], starts: number[], pageCount: number) {
  return starts.sort((a, b) => a - b).map((startPage, index) => {
    const found = existing.find((section) => section.startPage === startPage);
    const endPage = (starts[index + 1] ?? pageCount + 1) - 1;
    return {
      id: `section-${index + 1}`,
      title: found?.title || `段落 ${index + 1}`,
      summary: found?.summary || "請由教師補充這一段的內容摘要。",
      startPage,
      endPage,
      evidencePages: found?.evidencePages?.filter((page) => page >= startPage && page <= endPage).length ? found.evidencePages.filter((page) => page >= startPage && page <= endPage) : startPage === endPage ? [startPage] : [startPage, endPage],
    };
  });
}

export function BuilderApp() {
  const router = useRouter();
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const thumbBlobs = useRef(new Map<number, Blob>());
  const thumbUrls = useRef<PageThumb[]>([]);
  const localDraftAttempted = useRef(false);
  const [inviteCode, setInviteCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [manifest, setManifest] = useState<CourseManifest | null>(null);
  const [thumbs, setThumbs] = useState<PageThumb[]>([]);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [visualConfirmed, setVisualConfirmed] = useState(false);
  const [notice, setNotice] = useState("先選擇一份未加密、20 MB／100 頁以內的 PDF。");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const validation = useMemo(() => manifest ? validateManifest(manifest) : { ok: false, errors: [] }, [manifest]);
  const boundaryStarts = useMemo(() => new Set(manifest?.sections.map((section) => section.startPage) ?? []), [manifest]);
  const checkpointSet = useMemo(() => new Set(manifest?.checkpoints ?? []), [manifest]);

  const loadPdf = useCallback(async (nextFile: File, agentDraft?: CourseManifest) => {
    setBusy(true);
    setNotice("正在讀取 PDF 與建立頁面時間軸…");
    thumbUrls.current.forEach((thumb) => URL.revokeObjectURL(thumb.url));
    thumbUrls.current = [];
    setThumbs([]);
    thumbBlobs.current.clear();
    try {
      if (nextFile.type !== "application/pdf" || nextFile.size < 1 || nextFile.size > 20 * 1024 * 1024) throw new Error("PDF 必須介於 1 byte–20 MB。");
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const document = await pdfjs.getDocument({ data: new Uint8Array(await nextFile.arrayBuffer()) }).promise;
      if (document.numPages < 1 || document.numPages > 100) throw new Error("PDF 頁數必須介於 1–100。");
      const checksum = await sha256(nextFile);
      const baseName = nextFile.name.replace(/\.pdf$/i, "");
      const courseId = safeCourseId(`${baseName}-${checksum.slice(0, 8)}`);
      const fallback = createFallbackManifest({ courseId, title: baseName || "未命名課程", fileName: nextFile.name, sha256: checksum, pageCount: document.numPages });
      if (agentDraft) {
        const result = validateManifest(agentDraft);
        if (!result.ok) throw new Error(result.errors.join("\n"));
        if (agentDraft.source.sha256 !== checksum || agentDraft.source.pageCount !== document.numPages) {
          throw new Error("Agent 草稿的 PDF checksum 或頁數與目前講義不一致。");
        }
      }
      const nextManifest = agentDraft ?? fallback;
      documentRef.current = document;
      setFile(nextFile);
      setManifest(nextManifest);
      const nextThumbs: PageThumb[] = [];
      for (let page = 1; page <= document.numPages; page += 1) {
        const blob = await renderPage(document, page, 360, 0.78);
        thumbBlobs.current.set(page, blob);
        nextThumbs.push({ page, url: URL.createObjectURL(blob) });
        setProgress(Math.round((page / document.numPages) * 100));
      }
      thumbUrls.current = nextThumbs;
      setThumbs(nextThumbs);
      setNotice(agentDraft
        ? `已載入 Agent 草稿：${agentDraft.sections.length} 個連續段落。請逐頁確認並自行設定停靠頁。`
        : `已讀取 ${document.numPages} 頁，目前為涵蓋全部頁面的單一段落；可匯入 Agent 草稿或直接人工分段。`);
    } catch (error) {
      setFile(null);
      setManifest(null);
      documentRef.current = null;
      setNotice(error instanceof Error ? error.message : "PDF 無法讀取。");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }, []);

  useEffect(() => {
    if (localDraftAttempted.current || new URLSearchParams(window.location.search).get("draft") !== "local") return;
    localDraftAttempted.current = true;
    void (async () => {
      try {
        setBusy(true);
        setNotice("正在載入 Agent 準備的本機審查草稿…");
        const [manifestResponse, pdfResponse] = await Promise.all([
          fetch("/local-course.manifest.json", { cache: "no-store" }),
          fetch("/local-course.pdf", { cache: "no-store" }),
        ]);
        if (!manifestResponse.ok || !pdfResponse.ok) throw new Error("找不到本機審查資料；請先執行 npm run course:review。");
        const candidate = JSON.parse(await manifestResponse.text()) as CourseManifest;
        const candidateResult = validateManifest(candidate);
        if (!candidateResult.ok) throw new Error(candidateResult.errors.join("\n"));
        const pdf = new File([await pdfResponse.blob()], candidate.source.fileName, { type: "application/pdf" });
        await loadPdf(pdf, candidate);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "本機 Agent 草稿無法載入；仍可手動選擇 PDF 與 Manifest。");
        setBusy(false);
      }
    })();
  }, [loadPdf]);

  const toggleBoundary = (page: number) => {
    if (!manifest || page === 1) return;
    const starts = new Set(manifest.sections.map((section) => section.startPage));
    if (starts.has(page)) starts.delete(page);
    else starts.add(page);
    setManifest({ ...manifest, sections: rebuildSections(manifest.sections, [...starts], manifest.source.pageCount) });
  };

  const toggleCheckpoint = (page: number) => {
    if (!manifest) return;
    const next = new Set(manifest.checkpoints);
    if (next.has(page)) next.delete(page);
    else next.add(page);
    setManifest({ ...manifest, checkpoints: [...next].sort((a, b) => a - b) });
  };

  const updateSection = (id: string, patch: Partial<CourseSection>) => {
    if (!manifest) return;
    setManifest({ ...manifest, sections: manifest.sections.map((section) => section.id === id ? { ...section, ...patch } : section) });
  };

  const importManifest = async (candidateFile: File) => {
    if (!manifest) return;
    try {
      const candidate = JSON.parse(await candidateFile.text()) as CourseManifest;
      const result = validateManifest(candidate);
      if (!result.ok) throw new Error(result.errors.join("\n"));
      if (candidate.source.sha256 !== manifest.source.sha256 || candidate.source.pageCount !== manifest.source.pageCount) {
        throw new Error("Manifest 的 PDF checksum 或頁數與目前講義不一致。");
      }
      setManifest(candidate);
      setNotice("已匯入相同 schema 的 Manifest；請重新逐頁確認分段與停靠頁。");
      setVisualConfirmed(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Manifest 匯入失敗。");
    }
  };

  const createCourse = async () => {
    if (!file || !manifest || !documentRef.current || !inviteCode || !privacyConfirmed || !visualConfirmed || !validation.ok) { setNotice("請輸入邀請碼、確認教材可上傳，完成頁面檢查並修正分段錯誤。"); return; }
    setBusy(true);
    try {
      setNotice("正在建立課程資料…");
      const form = new FormData();
      form.append("pdf", file);
      form.append("manifest", JSON.stringify(manifest));
      const createResponse = await fetch("/api/courses", { method: "POST", headers: { "x-pilot-code": inviteCode }, body: form });
      const created = await responseJson<{ course?: { id: string }; adminToken?: string; error?: string }>(createResponse);
      if (!createResponse.ok || !created.course || !created.adminToken) throw new Error(created.error || "無法建立課程。");
      const token = created.adminToken;
      for (let page = 1; page <= manifest.source.pageCount; page += 1) {
        const full = await renderPage(documentRef.current, page, 1600, 0.88);
        const thumb = thumbBlobs.current.get(page) ?? await renderPage(documentRef.current, page, 360, 0.78);
        for (const [kind, blob] of [["pages", full], ["thumbs", thumb]] as const) {
          const upload = await fetch(`/api/courses/${manifest.courseId}/assets/${kind}/${page}`, { method: "PUT", headers: { authorization: `Bearer ${token}`, "content-type": "image/jpeg" }, body: blob });
          if (!upload.ok) { const data = await responseJson<{ error?: string }>(upload); throw new Error(data.error || `第 ${page} 頁上傳失敗。`); }
        }
        setProgress(Math.round((page / manifest.source.pageCount) * 100));
        setNotice(`正在上傳課程頁面 ${page}/${manifest.source.pageCount}…`);
      }
      const finalize = await fetch(`/api/courses/${manifest.courseId}`, { method: "PATCH", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ action: "finalize" }) });
      const finalized = await responseJson<{ error?: string }>(finalize);
      if (!finalize.ok) throw new Error(finalized.error || "課程確認失敗。");
      localStorage.setItem(`paper-lab-course-${manifest.courseId}`, token);
      router.push(`/manage/${manifest.courseId}#token=${token}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "無法建立課程。");
    } finally { setBusy(false); setProgress(0); }
  };

  return (
    <main className="builder-shell">
      <header className="builder-header"><Link className="wordmark" href="/">PAPER LAB</Link><nav><Link href="/guide">操作教學</Link><span>課程建立器</span></nav></header>
      <section className="builder-intro">
        <p className="eyebrow">PDF → CONTENT MAP → CLASSROOM</p>
        <h1>保留原講義，<br />只整理課堂脈絡。</h1>
        <p>可匯入 Codex／Claude Code 的分段草稿，也可完全由教師人工整理。停靠頁、提問節奏與最後決定都由教師掌握。</p>
      </section>

      <section className="builder-panel upload-panel">
        <div><span className="step-number">01</span><div><h2>選擇講義</h2><p>未加密 PDF，最多 20 MB／100 頁。</p></div></div>
        <label className="field-label">Pilot 邀請碼<input type="password" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="輸入受控試用邀請碼" /></label>
        <label className="drop-zone"><input type="file" accept="application/pdf" disabled={busy} onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void loadPdf(selected); }} /><b>{file ? file.name : "選擇 PDF"}</b><span>{manifest ? `${manifest.source.pageCount} 頁 · checksum ${manifest.source.sha256.slice(0, 10)}…` : "內容與頁序不會被改寫"}</span></label>
        <label className="consent-row"><input type="checkbox" checked={privacyConfirmed} onChange={(event) => setPrivacyConfirmed(event.target.checked)} /><span>我確認有權將這份教材存入本 Paper Lab 環境，且教材不含病人姓名、病歷號或其他敏感個資。</span></label>
        <p className="builder-notice" role="status">{notice}{busy && progress > 0 ? ` ${progress}%` : ""}</p>
      </section>

      {manifest && thumbs.length > 0 && (
        <>
          <section className="builder-panel">
            <div><span className="step-number">02</span><div><h2>選擇整理方式並逐頁確認</h2><p>匯入 Agent 草稿，或直接從單一段落開始人工調整。</p></div></div>
            <label className="field-label">課程名稱<input value={manifest.title} onChange={(event) => setManifest({ ...manifest, title: event.target.value })} /></label>
            <div className="segmentation-options">
              <label className="manifest-import"><span><b>匯入 Agent 草稿</b><small>接受 Codex／Claude Code 產生、且與目前 PDF checksum 相同的 Manifest。</small></span><input type="file" accept="application/json" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void importManifest(selected); }} /></label>
              <div className="manual-segmentation"><b>直接人工分段</b><small>點選任一頁的「從此分段」，即可拆分目前的連續段落；不需要任何模型 API。</small></div>
            </div>
            <div className="page-timeline">
              {thumbs.map((thumb) => {
                const section = manifest.sections.find((item) => thumb.page >= item.startPage && thumb.page <= item.endPage)!;
                return <article className={checkpointSet.has(thumb.page) ? "timeline-page checkpoint" : "timeline-page"} key={thumb.page}>
                  <div className="thumb-frame"><img src={thumb.url} alt={`講義第 ${thumb.page} 頁縮圖`} /></div>
                  <div><b>p.{thumb.page}</b><span>{section.title}</span></div>
                  {thumb.page > 1 && <button onClick={() => toggleBoundary(thumb.page)}>{boundaryStarts.has(thumb.page) ? "合併前段" : "從此分段"}</button>}
                  <button className="checkpoint-toggle" onClick={() => toggleCheckpoint(thumb.page)}>{checkpointSet.has(thumb.page) ? "取消停靠" : "設為停靠"}</button>
                </article>;
              })}
            </div>
          </section>

          <section className="builder-panel">
            <div><span className="step-number">03</span><div><h2>段落內容</h2><p>Agent 草稿或人工設定都必須由教師回看頁碼後確認。</p></div></div>
            <div className="section-editor-list">
              {manifest.sections.map((section, index) => <article key={section.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><label>段落名稱<input value={section.title} onChange={(event) => updateSection(section.id, { title: event.target.value })} /></label><label>一句摘要<textarea value={section.summary} onChange={(event) => updateSection(section.id, { summary: event.target.value })} /></label></div>
                <small>p.{section.startPage}–{section.endPage} · 依據 p.{section.evidencePages.join("、")}</small>
              </article>)}
            </div>
            {!validation.ok && <div className="validation-errors">{validation.errors.map((error) => <p key={error}>{error}</p>)}</div>}
            <label className="consent-row"><input type="checkbox" checked={visualConfirmed} onChange={(event) => setVisualConfirmed(event.target.checked)} /><span>我已檢查第一頁、代表性中間頁與最後一頁，確認無裁切、旋轉錯誤或不可讀文字。</span></label>
            <button className="primary-button create-course-button" disabled={busy || !privacyConfirmed || !visualConfirmed || !validation.ok} onClick={() => void createCourse()}>確認並建立互動課堂</button>
          </section>
        </>
      )}
    </main>
  );
}
