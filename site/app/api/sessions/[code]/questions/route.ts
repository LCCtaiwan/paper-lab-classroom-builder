import { questions } from "../../../../../db/schema";
import { getDb } from "../../../../../db";
import { findSession } from "../../../../../lib/classroom-store";
import { sectionForPage } from "../../../../../lib/course-manifest.mjs";
import { jsonError } from "../../../../../lib/api-response";

type Context = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const { code } = await params;
    const found = await findSession(code);
    if (!found) return Response.json({ error: "找不到課堂代碼" }, { status: 404 });
    if (found.session.status !== "active") return Response.json({ error: "課堂已結束。" }, { status: 409 });
    const payload = await request.json() as { nickname?: string; clientId?: string; body?: string };
    const nickname = String(payload.nickname ?? "").trim().slice(0, 20);
    const clientId = String(payload.clientId ?? "").trim().slice(0, 100);
    const body = String(payload.body ?? "").trim().slice(0, 500);
    if (!nickname || !clientId || !body) return Response.json({ error: "請輸入暱稱與問題。" }, { status: 400 });
    const section = sectionForPage(found.course.manifest, found.session.currentPage);
    const [question] = await getDb().insert(questions).values({ sessionId: found.session.id, nickname, clientId, body, pageNumber: found.session.currentPage, sectionId: section.id }).returning();
    return Response.json({ question: { ...question, votes: 0 } }, { status: 201 });
  } catch (error) {
    return jsonError(error, "無法送出問題");
  }
}
