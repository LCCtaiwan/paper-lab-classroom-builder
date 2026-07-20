import { requireCourseAdmin } from "../../../../../lib/classroom-store";
import { jsonError } from "../../../../../lib/api-response";
import { getFilesBucket } from "../../../../../lib/security";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { courseId } = await params;
    const course = await requireCourseAdmin(request, courseId);
    const object = await getFilesBucket().get(`courses/${courseId}/source.pdf`);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(course.manifest.source.fileName)}`, "cache-control": "private, no-store" } });
  } catch (error) {
    return jsonError(error, "無法讀取原始 PDF");
  }
}
