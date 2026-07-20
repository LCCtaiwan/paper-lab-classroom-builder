import { desc, eq } from "drizzle-orm";
import { courseSessions } from "../../../../../db/schema";
import { getDb } from "../../../../../db";
import { requireCourseAdmin } from "../../../../../lib/classroom-store";
import { jsonError } from "../../../../../lib/api-response";
import { hashToken, randomToken } from "../../../../../lib/security";

type Context = { params: Promise<{ courseId: string }> };
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const roomCode = () => Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");

export async function GET(request: Request, { params }: Context) {
  try {
    const { courseId } = await params;
    await requireCourseAdmin(request, courseId);
    const sessions = await getDb().select({ code: courseSessions.code, status: courseSessions.status, createdAt: courseSessions.createdAt, endedAt: courseSessions.endedAt }).from(courseSessions).where(eq(courseSessions.courseId, courseId)).orderBy(desc(courseSessions.id)).limit(30);
    return Response.json({ sessions });
  } catch (error) {
    return jsonError(error, "無法讀取課堂場次");
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const { courseId } = await params;
    const course = await requireCourseAdmin(request, courseId);
    if (course.status !== "ready") return Response.json({ error: "課程頁面尚未確認完成。" }, { status: 409 });
    const hostToken = randomToken();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const [session] = await getDb().insert(courseSessions).values({ courseId, code: roomCode(), hostTokenHash: await hashToken(hostToken) }).returning();
        return Response.json({ session: { code: session.code, currentPage: session.currentPage, status: session.status }, hostToken }, { status: 201 });
      } catch (error) {
        if (attempt === 4) throw error;
      }
    }
    return Response.json({ error: "無法建立六碼場次。" }, { status: 500 });
  } catch (error) {
    return jsonError(error, "無法建立課堂場次");
  }
}
