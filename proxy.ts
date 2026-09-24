import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
const DEV_SESSION_SECRET = "dev-only-insecure-session-secret-change-me-please";

/**
 * Optimistic admin gate: keeps visitors without a valid signed session cookie
 * away from /admin. Real authorisation (active profile, role, permissions)
 * still happens server-side in requireUser() for every page and action.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const secret = process.env.SESSION_SECRET || DEV_SESSION_SECRET;
  const signedIn = Boolean(verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, secret));

  if (!signedIn && !isPublicAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  if (signedIn && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next({ request });
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
