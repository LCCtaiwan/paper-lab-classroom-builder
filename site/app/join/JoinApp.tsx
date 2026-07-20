"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassroomSnapshot } from "../../lib/classroom-types";
import { sectionForPage } from "../../lib/course-manifest.mjs";

function clientId() {
  const key = "paper-lab-client-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  localStorage.setItem(key, value);
  return value;
}

export function JoinApp({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [snapshot, setSnapshot] = useState<ClassroomSnapshot | null>(null);
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (roomCode = code) => {
    const response = await fetch(`/api/sessions/${roomCode.toUpperCase()}`, { cache: "no-store" });
    const data = await response.json() as ClassroomSnapshot & { error?: string };
    if (!response.ok) throw new Error(data.error || "找不到課堂代碼。");
    setSnapshot(data);
    return data;
  }, [code]);

  useEffect(() => { if (!joined) return; const timer = window.setInterval(() => void load().catch(() => setNotice("正在重新連線…")), 1800); return () => window.clearInterval(timer); }, [joined, load]);

  const join = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || !nickname.trim()) { setNotice("請輸入六碼與暱稱。"); return; }
    try { await load(code); localStorage.setItem(`paper-lab-name-${code.toUpperCase()}`, nickname.trim()); setJoined(true); setNotice(""); }
    catch (error) { setNotice(error instanceof Error ? error.message : "無法加入課堂。"); }
  };

  useEffect(() => { const timer = window.setTimeout(() => { if (initialCode) setNickname(localStorage.getItem(`paper-lab-name-${initialCode}`) || ""); }, 0); return () => window.clearTimeout(timer); }, [initialCode]);

  const sendQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;
    const response = await fetch(`/api/sessions/${code}/questions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nickname, clientId: clientId(), body: question }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setNotice(data.error || "問題送出失敗。"); return; }
    setQuestion(""); setNotice("問題已送出，並自動記錄目前講義頁面。"); await load();
  };

  const react = async (id: number) => {
    const response = await fetch(`/api/sessions/${code}/questions/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientId: clientId() }) });
    const data = await response.json() as { error?: string; alreadyReacted?: boolean };
    if (!response.ok) { setNotice(data.error || "同問失敗。"); return; }
    setNotice(data.alreadyReacted ? "你已經對這題按過同問。" : "已加入同問。"); await load();
  };

  const questions = useMemo(() => [...(snapshot?.questions ?? [])].sort((a, b) => b.votes - a.votes || b.id - a.id), [snapshot?.questions]);
  if (!joined || !snapshot) return <main className="join-entry"><Link className="wordmark" href="/">PAPER LAB</Link><section className="join-card"><p className="eyebrow">JOIN CLASSROOM</p><h1>加入課堂</h1><p>不需帳號。請輸入講師提供的六碼與自訂暱稱。</p><form onSubmit={join}><label>課堂代碼<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={6} placeholder="例如 AB3K7M" /></label><label>暱稱<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={20} placeholder="例如 小藥師" /></label><button className="primary-button">進入提問頁</button></form>{notice && <p className="form-notice">{notice}</p>}<small>請勿輸入病人姓名、病歷號或其他個資。</small></section></main>;
  const section = sectionForPage(snapshot.course.manifest, snapshot.session.currentPage);
  return <main className="student-shell"><header className="student-topbar"><b>{snapshot.course.title}</b><div><span>課堂</span><strong>{code}</strong></div></header><section className="student-progress"><div><span>目前講義 p.{snapshot.session.currentPage}/{snapshot.course.manifest.source.pageCount}</span><b>{section.title}</b></div><div className="student-track"><i style={{ width: `${snapshot.session.currentPage / snapshot.course.manifest.source.pageCount * 100}%` }} /></div></section><section className="student-main"><p className="eyebrow">CURRENT SECTION</p><h1>{section.title}</h1><p className="student-section-subtitle">{section.summary}</p><div className="question-guidance"><b>卡住時就提出來</b><p>問題會自動連到現在的講義頁面；看見相同困惑可以按「同問」。</p></div></section><section className="student-community"><div className="question-compose-heading"><span>p.{snapshot.session.currentPage}</span><h2>你現在最想釐清什麼？</h2></div><form className="compose-form" onSubmit={sendQuestion}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder="請勿輸入病人個資…" /><button className="primary-button" disabled={snapshot.session.status === "closed"}>送出問題</button></form>{notice && <p className="form-notice">{notice}</p>}<div className="question-feed"><h2>共同困惑</h2>{questions.map((item) => <article key={item.id}><div><b>{item.nickname} · p.{item.pageNumber}</b><button onClick={() => void react(item.id)}>▲ {item.votes || "同問"}</button></div><p>{item.body}</p></article>)}{questions.length === 0 && <p className="empty-state">還沒有問題，你可以成為第一個提問的人。</p>}</div></section></main>;
}
