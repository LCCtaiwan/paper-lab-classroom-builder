export function jsonError(error: unknown, fallback: string, status = 500) {
  if (error instanceof Response) return error;
  return Response.json({ error: error instanceof Error ? error.message : fallback }, { status });
}
