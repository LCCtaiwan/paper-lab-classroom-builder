import { Buffer } from "node:buffer";
import { env } from "cloudflare:workers";
import { parseManifest, normalizeAnalysisDraft } from "../../../lib/course-manifest.mjs";
import { jsonError } from "../../../lib/api-response";
import { requirePilotInvite } from "../../../lib/security";

export async function POST(request: Request) {
  try {
    requirePilotInvite(request);
    const form = await request.formData();
    if (form.get("consent") !== "true") return Response.json({ error: "請先確認教材不含病人個資並同意 AI 資料政策。" }, { status: 400 });
    const file = form.get("pdf");
    const fallbackText = form.get("fallback");
    if (!(file instanceof File) || typeof fallbackText !== "string") return Response.json({ error: "缺少 PDF 或 fallback Manifest。" }, { status: 400 });
    if (file.size < 1 || file.size > 20 * 1024 * 1024 || file.type !== "application/pdf") return Response.json({ error: "PDF 必須介於 1 byte–20 MB。" }, { status: 400 });
    const pdfBytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(pdfBytes.slice(0, 5)) !== "%PDF-") return Response.json({ error: "檔案不是合法 PDF。" }, { status: 400 });
    const fallback = parseManifest(fallbackText);
    const runtimeEnv = env as unknown as { GEMINI_API_KEY?: string; GEMINI_MODEL?: string };
    if (!runtimeEnv.GEMINI_API_KEY) {
      return Response.json({ manifest: fallback, warning: "尚未設定 Gemini API key，已改用人工分段模式。" });
    }
    const model = runtimeEnv.GEMINI_MODEL || "gemini-2.5-flash";
    const prompt = `你是醫療教學內容分析助理。只分析附件 PDF 的內容結構，不產生教案、互動題、講稿或停靠點。\n請輸出單一 JSON object：{\"title\":string,\"sections\":[{\"title\":string,\"summary\":string,\"startPage\":integer,\"endPage\":integer,\"evidencePages\":integer[]}]}。\nsections 必須依原頁序連續、無重疊、無缺頁，完整覆蓋第 1–${fallback.source.pageCount} 頁；每段 summary 一句話；evidencePages 只能落在該段。`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(runtimeEnv.GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt },
          { inline_data: { mime_type: "application/pdf", data: Buffer.from(pdfBytes).toString("base64") } },
        ] }],
        generation_config: { response_mime_type: "application/json", temperature: 0.2 },
      }),
    });
    if (!response.ok) return Response.json({ manifest: fallback, warning: `AI 分析暫時不可用（${response.status}），已保留人工分段。` });
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) return Response.json({ manifest: fallback, warning: "AI 沒有回傳可用分段，已保留人工模式。" });
    let draft;
    try { draft = JSON.parse(text); } catch { draft = null; }
    const manifest = normalizeAnalysisDraft(draft, fallback);
    return Response.json({ manifest, warning: manifest === fallback ? "AI 分段未通過頁碼驗證，已保留人工模式。" : null });
  } catch (error) {
    return jsonError(error, "無法分析 PDF");
  }
}
