import { and, eq } from "drizzle-orm";
import { questions, reactions } from "../../../../../../db/schema";
import { getDb } from "../../../../../../db";
import { findSession, requireSessionHost } from "../../../../../../lib/classroom-store";
import { jsonError } from "../../../../../../lib/api-response";

type Context = { params: Promise<{ code: string; questionId: string }> };

export async function POST(request: Request, { params }: Context) {
  try {
    const { code, questionId } = await params;
    const found = await findSession(code);
    if (!found) return Response.json({ error: "找不到課堂代碼" }, { status: 404 });
    const id = Number(questionId);
    const [question] = await getDb().select({ id: questions.id }).from(questions).where(and(eq(questions.id, id), eq(questions.sessionId, found.session.id), eq(questions.hidden, false))).limit(1);
    if (!question) return Response.json({ error: "找不到問題" }, { status: 404 });
    const payload = await request.json() as { clientId?: string };
    const clientId = String(payload.clientId ?? "").trim().slice(0, 100);
    if (!clientId) return Response.json({ error: "缺少學生識別。" }, { status: 400 });
    try { await getDb().insert(reactions).values({ questionId: id, clientId }); }
    catch { return Response.json({ ok: true, alreadyReacted: true }); }
    return Response.json({ ok: true, alreadyReacted: false });
  } catch (error) {
    return jsonError(error, "無法加入同問");
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { code, questionId } = await params;
    const found = await requireSessionHost(request, code);
    const id = Number(questionId);
    const [question] = await getDb().select({ id: questions.id }).from(questions).where(and(eq(questions.id, id), eq(questions.sessionId, found.session.id))).limit(1);
    if (!question) return Response.json({ error: "找不到問題" }, { status: 404 });
    await getDb().update(questions).set({ hidden: true }).where(eq(questions.id, id));
    if (found.session.featuredQuestionId === id) {
      const { courseSessions } = await import("../../../../../../db/schema");
      await getDb().update(courseSessions).set({ featuredQuestionId: null }).where(eq(courseSessions.id, found.session.id));
    }
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error, "無法隱藏問題");
  }
}
