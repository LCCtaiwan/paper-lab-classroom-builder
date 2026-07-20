import { findCourse, requireCourseAdmin } from "../../../../../../../lib/classroom-store";
import { jsonError } from "../../../../../../../lib/api-response";
import { getFilesBucket } from "../../../../../../../lib/security";

type Context = { params: Promise<{ courseId: string; kind: string; page: string }> };

function keyFor(courseId: string, kind: string, page: number) {
  if (kind !== "pages" && kind !== "thumbs") throw new Error("Asset kind 無效。");
  const prefix = kind === "pages" ? "page" : "thumb";
  return `courses/${courseId}/${kind}/${prefix}-${String(page).padStart(3, "0")}.jpg`;
}

export async function GET(_: Request, { params }: Context) {
  try {
    const { courseId, kind, page: pageText } = await params;
    const course = await findCourse(courseId);
    const page = Number(pageText);
    if (!course || !Number.isInteger(page) || page < 1 || page > course.manifest.source.pageCount) return new Response("Not found", { status: 404 });
    const object = await getFilesBucket().get(keyFor(courseId, kind, page));
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, { headers: { "content-type": object.httpMetadata?.contentType || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
  } catch (error) {
    return jsonError(error, "無法讀取課程頁面");
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { courseId, kind, page: pageText } = await params;
    const course = await requireCourseAdmin(request, courseId);
    const page = Number(pageText);
    if (!Number.isInteger(page) || page < 1 || page > course.manifest.source.pageCount) return Response.json({ error: "頁碼超出範圍。" }, { status: 400 });
    if (!request.headers.get("content-type")?.startsWith("image/jpeg")) return Response.json({ error: "只接受 JPEG 頁面資產。" }, { status: 400 });
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength < 100 || bytes.byteLength > 3 * 1024 * 1024) return Response.json({ error: "頁面影像大小無效。" }, { status: 400 });
    await getFilesBucket().put(keyFor(courseId, kind, page), bytes, { httpMetadata: { contentType: "image/jpeg" } });
    return Response.json({ ok: true, page, kind });
  } catch (error) {
    return jsonError(error, "無法上傳課程頁面");
  }
}
