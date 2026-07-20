import { env } from "cloudflare:workers";

export async function hashToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function bearerToken(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

export async function tokenMatches(token: string, expectedHash: string) {
  if (!token || !expectedHash) return false;
  const actual = await hashToken(token);
  if (actual.length !== expectedHash.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ expectedHash.charCodeAt(index);
  return difference === 0;
}

export function requirePilotInvite(request: Request) {
  const configured = String((env as unknown as { PILOT_INVITE_CODE?: string }).PILOT_INVITE_CODE ?? "");
  if (configured.length < 12) throw new Error("伺服器尚未設定至少 12 字元的 PILOT_INVITE_CODE。");
  const supplied = request.headers.get("x-pilot-code") ?? "";
  if (!supplied || supplied !== configured) throw new Error("Pilot 邀請碼不正確。");
}

export function getFilesBucket() {
  const bucket = (env as unknown as { FILES?: R2Bucket }).FILES;
  if (!bucket) throw new Error("Cloudflare R2 binding `FILES` is unavailable.");
  return bucket;
}

export function randomToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
}
