"use client";

/* eslint-disable @next/next/no-img-element -- Classroom assets and QR codes are runtime-generated. */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { ClassroomSnapshot } from "../../../lib/classroom-types";
import { sectionForPage } from "../../../lib/course-manifest.mjs";

type Update = { currentPage?: number; featuredQuestionId?: number | null; status?: string };

export function HostApp({ initialCode }: { initialCode: string }) {
  const [snapshot, setSnapshot] = useState<ClassroomSnapshot | null>(null);
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("正在連接課堂…");
  const [qr, setQr] = useState("");
  const [showQr, setShowQr] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tokenRef = useRef("");
  const pending = useRef<Update>({});

  const load = useCallback(async () => {
    const response = await fetch(`/api/sessions/${initialCode}`, { cache: "no-store", headers: tokenRef.current ? { authorization: `Bearer ${tokenRef.current}` } : {} });
    const data = await response.json() as ClassroomSnapshot & { error?: string };
    if (!response.ok) throw new Error(data.error || "課堂連線失敗。");
    const optimistic = pending.current;
    const stillPending: Update = {};
    if (typeof optimistic.currentPage === "number" && data.session.currentPage !== optimistic.currentPage) stillPending.currentPage = optimistic.currentPage;
    if ("featuredQuestionId" in optimistic && data.session.featuredQuestionId !== optimistic.featuredQuestionId) stillPending.featuredQuestionId = optimistic.featuredQuestionId;
    pending.current = stillPending;
    setSnapshot({ ...data, session: { ...data.session, ...stillPending } });
    setNotice("");
  }, [initialCode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const supplied = params.get("token") || localStorage.getItem(`paper-lab-host-${initialCode}`) || "";
      if (supplied) { localStorage.setItem(`paper-lab-host-${initialCode}`, supplied); tokenRef.current = supplied; setToken(supplied); }
      if (window.location.hash) history.replaceState(null, "", window.location.pathname);
      void load().catch((error) => setNotice(error instanceof Error ? error.message : "課堂連線失敗。"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialCode, load]);

  useEffect(() => {
    const timer = window.setInterval(() => void load().catch(() => setNotice("正在重新連線…")), 1800);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(`paper-lab-display-${initialCode}`);
    channelRef.current = channel;
    return () => channel.close();
  }, [initialCode]);

  const update = useCallback(async (patch: Update) => {
    if (!snapshot || !token) { setNotice("缺少講師管理 token；請從課程管理頁重新開啟場次。"); return; }
    pending.current = { ...pending.current, ...patch };
    setSnapshot((current) => current ? { ...current, session: { ...current.session, ...patch } } : current);
    channelRef.current?.postMessage(patch);
    const response = await fetch(`/api/sessions/${initialCode}`, { method: "PATCH", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(patch) });
    if (!response.ok) { const data = await response.json() as { error?: string }; pending.current = {}; setNotice(data.error || "講師控制更新失敗。"); await load().catch(() => undefined); }
  }, [initialCode, load, snapshot, token]);

  const page = snapshot?.session.currentPage ?? 1;
  const manifest = snapshot?.course.manifest;
  const section = manifest ? sectionForPage(manifest, page) : null;
  const questions = useMemo(() => [...(snapshot?.questions ?? [])].sort((a, b) => b.votes - a.votes || b.id - a.id), [snapshot?.questions]);
  const isCheckpoint = Boolean(manifest?.checkpoints.includes(page));

  const changePage = useCallback((nextPage: number) => {
    if (!manifest) return;
    void update({ currentPage: Math.max(1, Math.min(manifest.source.pageCount, nextPage)) });
  }, [manifest, update]);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.matches("input, textarea, select") || showQr) return;
      if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); changePage(page + 1); }
      if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); changePage(page - 1); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [changePage, page, showQr]);

  const openQr = async () => {
    const url = `${window.location.origin}/join/${initialCode}`;
    setQr(await QRCode.toDataURL(url, { width: 680, margin: 3, errorCorrectionLevel: "M", color: { dark: "#102a43", light: "#ffffff" } }));
    setShowQr(true);
  };

  const hideQuestion = async (id: number) => {
    const response = await fetch(`/api/sessions/${initialCode}/questions/${id}`, { method: "PATCH", headers: { authorization: `Bearer ${token}` } });
    if (!response.ok) { const data = await response.json() as { error?: string }; setNotice(data.error || "無法隱藏問題。"); return; }
    await load();
  };

  if (!snapshot) return <main className="host-empty"><p>{notice}</p></main>;
  return <main className="host-shell">
    {showQr && qr && <div className="qr-backdrop" onClick={() => setShowQr(false)}><section className="qr-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="qr-close" onClick={() => setShowQr(false)}>×</button><p>學生加入課堂</p><h2>掃描後直接進入</h2><img src={qr} alt={`課堂 ${initialCode} 加入 QR code`} /><div className="qr-room-code"><span>課堂代碼</span><strong>{initialCode}</strong></div><small>不需帳號，只需自訂暱稱。</small></section></div>}
    <header className="host-topbar"><div><Link className="wordmark" href="/">PAPER LAB</Link><span className="live-pill">講師後台</span></div><div className="room-code"><span>學生代碼</span><strong>{initialCode}</strong><span className="current-interaction">講義 {page}/{manifest?.source.pageCount} · {section?.title}</span></div><div className="top-actions"><button className="quiet-button" onClick={() => void openQr()}>加入 QR</button><button className="primary-button" onClick={() => window.open(`/display/${initialCode}`, "paper-lab-display", "popup=yes,width=1280,height=720")}>開啟投影視窗</button></div></header>
    {notice && <div className="notice-bar" role="status">{notice}</div>}
    <nav className="section-strip" aria-label="講義段落">{manifest?.sections.map((item, index) => <button key={item.id} className={item.id === section?.id ? "active" : ""} onClick={() => changePage(item.startPage)}><span>{index + 1}</span><b>{item.title}</b><small>p.{item.startPage}–{item.endPage}</small></button>)}</nav>
    <div className="presenter-workspace">
      <section className="presenter-preview">
        <div className="presenter-controlbar"><div><b>投影預覽</b><span>外接螢幕會同步這一頁</span></div><div className="page-controls"><button onClick={() => changePage(page - 1)} disabled={page === 1}>‹</button><label>第 <input type="number" min="1" max={manifest?.source.pageCount} value={page} onChange={(event) => changePage(Number(event.target.value) || 1)} /> / {manifest?.source.pageCount} 頁</label><button onClick={() => changePage(page + 1)} disabled={page === manifest?.source.pageCount}>›</button></div></div>
        {isCheckpoint && <div className="host-checkpoint"><div><b>教師設定的問題整理頁</b><span>可處理目前同問較多的問題，也可以直接繼續。</span></div><strong>{questions.length} 個問題</strong></div>}
        <div className="handout-slide presenter-slide"><img key={page} src={`/api/courses/${snapshot.course.id}/assets/pages/${page}`} alt={`講義第 ${page} 頁`} /></div>
        <p className="presenter-hint">使用 ←／→ 翻頁；問題不會自動出現在大螢幕。</p>
      </section>
      <aside className="classroom-panel presenter-questions"><div className="question-panel-heading"><div><span>目前段落</span><b>{section?.title}</b></div><strong>{questions.length}</strong></div><div className="panel-toolbar"><span>依同問數排序</span>{snapshot.session.featuredQuestionId && <button onClick={() => void update({ featuredQuestionId: null })}>收回投影問題</button>}</div><div className="message-list">{questions.map((question) => { const featured = question.id === snapshot.session.featuredQuestionId; return <article className={`${featured ? "message-card featured" : "message-card"}${question.hidden ? " message-card-hidden" : ""}`} key={question.id}><div><b>{question.nickname}</b><span>p.{question.pageNumber} · ▲ {question.votes}{question.hidden ? " · 已隱藏" : ""}</span></div><p>{question.body}</p><div className="question-card-actions"><button className="feature-question" disabled={question.hidden} onClick={() => void update({ featuredQuestionId: featured ? null : question.id })}>{question.hidden ? "課堂中已隱藏" : featured ? "從投影收回" : "投影這題"}</button><button disabled={question.hidden} onClick={() => void hideQuestion(question.id)}>{question.hidden ? "已隱藏" : "隱藏"}</button></div></article>; })}{questions.length === 0 && <p className="empty-state">學生問題會出現在這裡。</p>}</div><button className="reset-room panel-reset" disabled={snapshot.session.status === "closed"} onClick={() => { if (confirm("要結束這個場次嗎？")) void update({ status: "closed" }); }}>{snapshot.session.status === "closed" ? "場次已結束" : "結束場次"}</button></aside>
    </div>
  </main>;
}
