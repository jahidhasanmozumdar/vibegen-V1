import { createHmac, timingSafeEqual } from "node:crypto";

import type { Role } from "@/lib/data/types";

/**
 * Signed admin session token (httpOnly cookie) for both auth drivers.
 * Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256 with SESSION_SECRET).
 * With a database, the profile is re-checked on every request (lib/auth/session.ts).
 */
export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  exp: number; // epoch seconds
}

export const SESSION_COOKIE = "vg_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // one working day

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">, secret: string): string {
  const body: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encoded = b64url(JSON.stringify(body));
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = Buffer.from(sign(encoded, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Constant-time string comparison for credentials. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}
