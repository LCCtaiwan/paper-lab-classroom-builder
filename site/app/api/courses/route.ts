import { createHash } from "node:crypto";
import { courses } from "../../../db/schema";
import { ensureSchema, getDb } from "../../../db";
import { parseManifest } from "../../../lib/course-manifest.mjs";
import { jsonError } from "../../../lib/api-response";
import { getFilesBucket, hashToken, randomToken, requirePilotInvite } from "../../../lib/security";

export async function POST(request: Request) {
  try {
    requirePilotInvite(request);
    const form = await request.formData();
    const file = form.get("pdf");
    const manifestText = form.get("manifest");
    if (!(file instanceof File) || typeof manifestText !== "string") return Response.json({ error: "缺少 PDF 或 Manifest。" }, { status: 400 });
    if (file.size < 1 || file.size > 20 * 1024 * 1024 || file.type !== "application/pdf") return Response.json({ error: "PDF 必須介於 1 byte–20 MB。" }, { status: 400 });
    const manifest = parseManifest(manifestText);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") return Response.json({ error: "檔案不是合法 PDF。" }, { status: 400 });
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (sha256 !== manifest.source.sha256) return Response.json({ error: "PDF checksum 與 Manifest 不一致。" }, { status: 400 });
    await ensureSchema();
    const token = randomToken();
    try {
      await getDb().insert(courses).values({
        id: manifest.courseId,
        title: manifest.title,
        manifestJson: JSON.stringify(manifest),
        adminTokenHash: await hashToken(token),
        status: "draft",
      });
    } catch {
      return Response.json({ error: "courseId 已存在，請修改課程識別後再建立。" }, { status: 409 });
    }
    await getFilesBucket().put(`courses/${manifest.courseId}/source.pdf`, bytes, { httpMetadata: { contentType: "application/pdf" }, customMetadata: { sha256 } });
    return Response.json({ course: { id: manifest.courseId, title: manifest.title, status: "draft", manifest }, adminToken: token }, { status: 201 });
  } catch (error) {
    return jsonError(error, "無法建立課程");
  }
}
