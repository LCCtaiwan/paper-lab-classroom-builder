"use client";

/* eslint-disable @next/next/no-img-element -- Local CLI preview uses generated course assets. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CourseManifest } from "../../lib/course-manifest.mjs";
import { sectionForPage } from "../../lib/course-manifest.mjs";

export function LocalDemo() {
  const [manifest, setManifest] = useState<CourseManifest | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/local-course.manifest.json", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("請先執行 npm run course:preview")))
      .then((data: CourseManifest) => setManifest(data))
      .catch((reason) => { if (reason?.name !== "AbortError") setError(reason instanceof Error ? reason.message : "預覽讀取失敗。"); });
    return () => controller.abort();
  }, []);

  const section = useMemo(() => manifest ? sectionForPage(manifest, page) : null, [manifest, page]);
  if (!manifest) return <main className="host-empty"><p>{error || "正在讀取本機課程…"}</p></main>;
  const asset = `/courses/${manifest.courseId}/pages/page-${String(page).padStart(3, "0")}.jpg`;
  return <main className="local-demo-shell">
    <header className="host-topbar"><div><Link className="wordmark" href="/">PAPER LAB</Link><span className="live-pill">本機預覽</span></div><div className="room-code"><span>講義</span><strong>{page}/{manifest.source.pageCount}</strong></div><div className="top-actions"><Link className="quiet-button" href="/join">查看學生入口</Link></div></header>
    <nav className="section-strip">{manifest.sections.map((item, index) => <button key={item.id} className={item.id === section?.id ? "active" : ""} onClick={() => setPage(item.startPage)}><span>{index + 1}</span><b>{item.title}</b><small>p.{item.startPage}–{item.endPage}</small></button>)}</nav>
    <section className="local-demo-main"><div><p className="eyebrow">LOCAL MANIFEST PREVIEW</p><h1>{manifest.title}</h1><p>{section?.title} · {section?.summary}</p>{manifest.checkpoints.includes(page) && <b className="demo-checkpoint">教師設定的停靠頁</b>}</div><div className="handout-slide"><img src={asset} alt={`講義第 ${page} 頁`} /></div><div className="page-controls"><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>‹</button><label>第 {page} / {manifest.source.pageCount} 頁</label><button onClick={() => setPage(Math.min(manifest.source.pageCount, page + 1))} disabled={page === manifest.source.pageCount}>›</button></div></section>
  </main>;
}
