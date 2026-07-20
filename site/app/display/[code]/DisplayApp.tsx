"use client";

/* eslint-disable @next/next/no-img-element -- Slide images are streamed from course storage. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ClassroomSnapshot } from "../../../lib/classroom-types";

type LiveUpdate = { currentPage?: number; featuredQuestionId?: number | null };

export function DisplayApp({ initialCode }: { initialCode: string }) {
  const [snapshot, setSnapshot] = useState<ClassroomSnapshot | null>(null);
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const pending = useRef<LiveUpdate>({});
  const load = useCallback(async () => {
    const response = await fetch(`/api/sessions/${initialCode}`, { cache: "no-store" });
    const data = await response.json() as ClassroomSnapshot & { error?: string };
    if (!response.ok) throw new Error(data.error || "投影連線失敗。");
    const live = pending.current;
    const stillPending: LiveUpdate = {};
    if (typeof live.currentPage === "number" && live.currentPage !== data.session.currentPage) stillPending.currentPage = live.currentPage;
    if ("featuredQuestionId" in live && live.featuredQuestionId !== data.session.featuredQuestionId) stillPending.featuredQuestionId = live.featuredQuestionId;
    pending.current = stillPending;
    setSnapshot({ ...data, session: { ...data.session, ...stillPending } });
    setError("");
  }, [initialCode]);
  useEffect(() => { const initial = window.setTimeout(() => void load().catch((reason) => setError(reason instanceof Error ? reason.message : "投影連線失敗。")), 0); const timer = window.setInterval(() => void load().catch(() => setError("正在重新連線…")), 900); const channel = new BroadcastChannel(`paper-lab-display-${initialCode}`); channel.onmessage = (event: MessageEvent<LiveUpdate>) => { pending.current = { ...pending.current, ...event.data }; setSnapshot((current) => current ? { ...current, session: { ...current.session, ...event.data } } : current); }; return () => { window.clearTimeout(initial); window.clearInterval(timer); channel.close(); }; }, [initialCode, load]);
  useEffect(() => { const handler = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", handler); return () => document.removeEventListener("fullscreenchange", handler); }, []);
  useEffect(() => { if (!snapshot) return; const { currentPage } = snapshot.session; [currentPage - 1, currentPage + 1].filter((page) => page >= 1 && page <= snapshot.course.manifest.source.pageCount).forEach((page) => { const image = new Image(); image.src = `/api/courses/${snapshot.course.id}/assets/pages/${page}`; }); }, [snapshot]);
  if (!snapshot) return <main className="display-shell display-empty"><p>{error || "正在連接講師後台…"}</p></main>;
  const featured = snapshot.questions.find((question) => question.id === snapshot.session.featuredQuestionId);
  return <main className="display-shell"><img key={snapshot.session.currentPage} src={`/api/courses/${snapshot.course.id}/assets/pages/${snapshot.session.currentPage}`} alt={`講義第 ${snapshot.session.currentPage} 頁`} />{!fullscreen && <button className="display-fullscreen" onClick={() => void document.documentElement.requestFullscreen().catch(() => setError("瀏覽器未允許全螢幕。"))}>進入全螢幕</button>}{featured && <section className="display-question"><p>STUDENT QUESTION · p.{featured.pageNumber}</p><h1>{featured.body}</h1><div><b>{featured.nickname}</b><span>▲ {featured.votes} 人同問</span></div></section>}{error && <div className="display-error">{error}</div>}</main>;
}
