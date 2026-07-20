import { and, eq } from "drizzle-orm";
import { courseSessions, questions } from "../../../../db/schema";
import { getDb } from "../../../../db";
import { requireSessionHost, sessionSnapshot } from "../../../../lib/classroom-store";
import { jsonError } from "../../../../lib/api-response";
import { bearerToken } from "../../../../lib/security";

type Context = { params: Promise<{ code: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { code } = await params;
    let includeHidden = false;
    if (bearerToken(request)) {
      try { await requireSessionHost(request, code); includeHidden = true; }
      catch { includeHidden = false; }
    }
    const snapshot = await sessionSnapshot(code, includeHidden);
    if (!snapshot) return Response.json({ error: "找不到課堂代碼" }, { status: 404 });
    return Response.json(snapshot);
  } catch (error) {
    return jsonError(error, "無法讀取課堂");
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { code } = await params;
    const found = await requireSessionHost(request, code);
    const payload = await request.json() as { currentPage?: number; featuredQuestionId?: number | null; status?: string };
    const updates: { currentPage?: number; featuredQuestionId?: number | null; status?: string; endedAt?: string | null } = {};
    const pageCount = found.course.manifest.source.pageCount;
    if (payload.currentPage !== undefined) {
      if (!Number.isInteger(payload.currentPage) || payload.currentPage < 1 || payload.currentPage > pageCount) return Response.json({ error: "頁碼超出課程範圍。" }, { status: 400 });
      updates.currentPage = payload.currentPage;
    }
    if (payload.featuredQuestionId === null) updates.featuredQuestionId = null;
    if (Number.isInteger(payload.featuredQuestionId)) {
      const [question] = await getDb().select({ id: questions.id }).from(questions).where(and(eq(questions.id, payload.featuredQuestionId!), eq(questions.sessionId, found.session.id), eq(questions.hidden, false))).limit(1);
      if (!question) return Response.json({ error: "找不到要投影的問題。" }, { status: 400 });
      updates.featuredQuestionId = question.id;
    }
    if (payload.status === "closed") { updates.status = "closed"; updates.endedAt = new Date().toISOString(); }
    if (payload.status === "active") { updates.status = "active"; updates.endedAt = null; }
    const [session] = await getDb().update(courseSessions).set(updates).where(eq(courseSessions.id, found.session.id)).returning();
    return Response.json({ session: { code: session.code, currentPage: session.currentPage, featuredQuestionId: session.featuredQuestionId, status: session.status } });
  } catch (error) {
    return jsonError(error, "無法更新課堂");
  }
}
