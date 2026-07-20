import { and, eq } from "drizzle-orm";
import { courseSessions, courses } from "../../../../db/schema";
import { getDb } from "../../../../db";
import { findCourse, requireCourseAdmin } from "../../../../lib/classroom-store";
import { parseManifest } from "../../../../lib/course-manifest.mjs";
import { jsonError } from "../../../../lib/api-response";
import { getFilesBucket } from "../../../../lib/security";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    const { courseId } = await params;
    const course = await findCourse(courseId);
    if (!course) return Response.json({ error: "找不到課程" }, { status: 404 });
    return Response.json({ course: { id: course.id, title: course.title, status: course.status, manifest: course.manifest, createdAt: course.createdAt, updatedAt: course.updatedAt } });
  } catch (error) {
    return jsonError(error, "無法讀取課程");
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { courseId } = await params;
    const course = await requireCourseAdmin(request, courseId);
    const payload = await request.json() as { action?: string; manifest?: unknown };
    const db = getDb();
    if (payload.action === "update") {
      const active = await db.select({ id: courseSessions.id }).from(courseSessions).where(and(eq(courseSessions.courseId, courseId), eq(courseSessions.status, "active"))).limit(1);
      if (active.length) return Response.json({ error: "進行中場次不可修改課程結構。" }, { status: 409 });
      const manifest = parseManifest(JSON.stringify(payload.manifest));
      if (manifest.courseId !== courseId || manifest.source.sha256 !== course.manifest.source.sha256) return Response.json({ error: "不可更換課程識別或 PDF checksum。" }, { status: 400 });
      await db.update(courses).set({ title: manifest.title, manifestJson: JSON.stringify(manifest), updatedAt: new Date().toISOString() }).where(eq(courses.id, courseId));
      return Response.json({ course: { id: courseId, status: course.status, manifest } });
    }
    if (payload.action === "finalize") {
      for (let page = 1; page <= course.manifest.source.pageCount; page += 1) {
        const suffix = String(page).padStart(3, "0");
        if (!await getFilesBucket().head(`courses/${courseId}/pages/page-${suffix}.jpg`)) return Response.json({ error: `缺少第 ${page} 頁投影片。` }, { status: 409 });
        if (!await getFilesBucket().head(`courses/${courseId}/thumbs/thumb-${suffix}.jpg`)) return Response.json({ error: `缺少第 ${page} 頁縮圖。` }, { status: 409 });
      }
      await db.update(courses).set({ status: "ready", updatedAt: new Date().toISOString() }).where(eq(courses.id, courseId));
      return Response.json({ course: { id: courseId, title: course.title, status: "ready", manifest: course.manifest } });
    }
    return Response.json({ error: "不支援的課程操作。" }, { status: 400 });
  } catch (error) {
    return jsonError(error, "無法更新課程");
  }
}
