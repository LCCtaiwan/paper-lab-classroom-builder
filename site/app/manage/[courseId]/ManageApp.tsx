"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseManifest } from "../../../lib/course-manifest.mjs";
import { validateManifest } from "../../../lib/course-manifest.mjs";

type Course = { id: string; title: string; status: string; manifest: CourseManifest; createdAt?: string; updatedAt?: string };
type Session = { code: string; status: string; createdAt: string; endedAt: string | null };

export function ManageApp({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notice, setNotice] = useState("正在讀取課程…");
  const [busy, setBusy] = useState(false);

  const auth = useCallback((value = token) => ({ authorization: `Bearer ${value}` }), [token]);

  const load = useCallback(async (adminToken: string) => {
    const [courseResponse, sessionsResponse] = await Promise.all([
      fetch(`/api/courses/${courseId}`, { cache: "no-store" }),
      fetch(`/api/courses/${courseId}/sessions`, { headers: { authorization: `Bearer ${adminToken}` }, cache: "no-store" }),
    ]);
    const courseData = await courseResponse.json() as { course?: Course; error?: string };
    const sessionsData = await sessionsResponse.json() as { sessions?: Session[]; error?: string };
    if (!courseResponse.ok || !courseData.course) throw new Error(courseData.error || "找不到課程。");
    if (!sessionsResponse.ok) throw new Error(sessionsData.error || "管理連結已失效。");
    setCourse(courseData.course);
    setSessions(sessionsData.sessions ?? []);
    setNotice("");
  }, [courseId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const supplied = fragment.get("token") || localStorage.getItem(`paper-lab-course-${courseId}`) || "";
      if (!supplied) { setNotice("這個頁面需要課程管理連結。請重新開啟建立完成時取得的秘密連結。"); return; }
      localStorage.setItem(`paper-lab-course-${courseId}`, supplied);
      if (window.location.hash) history.replaceState(null, "", window.location.pathname);
      setToken(supplied);
      void load(supplied).catch((error) => setNotice(error instanceof Error ? error.message : "無法讀取課程。"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, load]);

  const createSession = async () => {
    if (!token) return;
    setBusy(true);
    setNotice("正在建立新的六碼場次…");
    try {
      const response = await fetch(`/api/courses/${courseId}/sessions`, { method: "POST", headers: auth() });
      const data = await response.json() as { session?: { code: string }; hostToken?: string; error?: string };
      if (!response.ok || !data.session || !data.hostToken) throw new Error(data.error || "無法建立場次。");
      localStorage.setItem(`paper-lab-host-${data.session.code}`, data.hostToken);
      router.push(`/host/${data.session.code}#token=${data.hostToken}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "無法建立場次。");
      setBusy(false);
    }
  };

  const exportManifest = () => {
    if (!course) return;
    const url = URL.createObjectURL(new Blob([`${JSON.stringify(course.manifest, null, 2)}\n`], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${course.id}.manifest.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importManifest = async (file: File) => {
    if (!course || !token) return;
    try {
      const manifest = JSON.parse(await file.text()) as CourseManifest;
      const result = validateManifest(manifest);
      if (!result.ok) throw new Error(result.errors.join("\n"));
      const response = await fetch(`/api/courses/${courseId}`, { method: "PATCH", headers: { ...auth(), "content-type": "application/json" }, body: JSON.stringify({ action: "update", manifest }) });
      const data = await response.json() as { course?: Course; error?: string };
      if (!response.ok) throw new Error(data.error || "Manifest 匯入失敗。");
      await load(token);
      setNotice("Manifest 已通過共用 validator 並更新。");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Manifest 匯入失敗。"); }
  };

  if (!course) return <main className="manage-shell"><p className="manage-status">{notice}</p></main>;
  return <main className="manage-shell">
    <header className="manage-header"><Link className="wordmark" href="/">PAPER LAB</Link><div><span>課程管理</span><b>{course.status === "ready" ? "已可開課" : "草稿"}</b></div></header>
    {notice && <div className="notice-bar" role="status">{notice}</div>}
    <section className="manage-hero">
      <div><p className="eyebrow">COURSE CONTROL</p><h1>{course.title}</h1><p>{course.manifest.source.pageCount} 頁 · {course.manifest.sections.length} 段 · {course.manifest.checkpoints.length} 個停靠頁</p></div>
      <button className="primary-button" disabled={busy || course.status !== "ready"} onClick={() => void createSession()}>建立新的授課場次</button>
    </section>
    <div className="manage-grid">
      <section className="manage-card">
        <div className="card-heading"><div><span>01</span><h2>課程地圖</h2></div><button className="quiet-button" onClick={exportManifest}>匯出 Manifest</button></div>
        <div className="manage-sections">{course.manifest.sections.map((section, index) => <article key={section.id}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{section.title}</b><p>{section.summary}</p><small>p.{section.startPage}–{section.endPage}</small></div></article>)}</div>
        <label className="manifest-import">從 Claude Code 匯回 Manifest<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importManifest(file); }} /></label>
      </section>
      <aside className="manage-card">
        <div className="card-heading"><div><span>02</span><h2>授課紀錄</h2></div></div>
        <div className="session-list">{sessions.map((session) => <a key={session.code} href={`/host/${session.code}`}><b>{session.code}</b><span>{session.status === "active" ? "進行中" : "已結束"}</span><small>{new Date(session.createdAt).toLocaleString("zh-TW")}</small></a>)}{sessions.length === 0 && <p>尚未建立授課場次。</p>}</div>
        <div className="backup-note"><b>原始 PDF 備援</b><p>管理端保留未修改 PDF；課堂網路異常時可下載備用。</p><button className="quiet-button" onClick={async () => { const response = await fetch(`/api/courses/${courseId}/source`, { headers: auth() }); if (!response.ok) { setNotice("原始 PDF 讀取失敗。"); return; } const url = URL.createObjectURL(await response.blob()); window.open(url, "_blank", "noopener,noreferrer"); }}>開啟原始 PDF</button></div>
      </aside>
    </div>
  </main>;
}
