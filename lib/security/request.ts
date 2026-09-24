import "server-only";

import { headers } from "next/headers";

export interface RequestContext {
  ip: string;
  userAgent: string;
  country: string | null;
  device: "mobile" | "tablet" | "desktop";
}

/** Best-effort request metadata. Country comes from the hosting platform's geo header when present. */
export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  const userAgent = h.get("user-agent") || "";
  const country = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null;
  return { ip, userAgent, country, device: detectDevice(userAgent) };
}

export function detectDevice(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|kindle|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}
