import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverEnv } from "@/lib/config/server-env";
import { dataDriver } from "@/lib/data";
import type { Role } from "@/lib/data/types";
import { verifyPassword } from "./password";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken, safeEqual, verifySessionToken } from "./token";

/*
 * Admin authentication — self-hosted, no third-party auth service.
 *
 * postgres driver: accounts are rows in `profiles` (+ `admin_credentials` with a
 *   scrypt hash). Sign-in issues a signed, httpOnly session cookie; every request
 *   re-checks the profile in the database, so deactivating a user or changing a
 *   role takes effect immediately.
 * local driver: a single demo admin from DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD.
 */

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Roles allowed into the admin at all. Finer checks use `can()`. */
export const STAFF_ROLES: Role[] = ["admin", "manager", "staff"];

export type Permission = "content:write" | "leads:delete" | "settings:write" | "demo:manage";

const PERMISSIONS: Record<Role, Permission[]> = {
  admin: ["content:write", "leads:delete", "settings:write", "demo:manage"],
  manager: ["content:write", "leads:delete"],
  staff: [],
};

export function can(user: SessionUser, permission: Permission): boolean {
  return PERMISSIONS[user.role].includes(permission);
}

export const authDriver: "database" | "local" = dataDriver === "postgres" ? "database" : "local";

async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = createSessionToken({ sub: user.id, email: user.email, name: user.name, role: user.role }, serverEnv().sessionSecret);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Loads an active staff profile by id (database driver). */
async function loadStaffProfile(id: string): Promise<SessionUser | null> {
  const { prisma } = await import("@/lib/db/prisma");
  const profile = await prisma()
    .profile.findUnique({ where: { id }, select: { id: true, email: true, full_name: true, role: true, active: true } })
    .catch(() => null);
  if (!profile || !profile.active || !STAFF_ROLES.includes(profile.role as Role)) return null;
  return { id: profile.id, email: profile.email, name: profile.full_name || profile.email, role: profile.role as Role };
}

/**
 * Resolve the current admin user. Deduplicated per request with React cache.
 * This is the real authorisation check; the proxy only does an optimistic redirect.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value, serverEnv().sessionSecret);
  if (!payload) return null;
  if (authDriver === "local") return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  return loadStaffProfile(payload.sub);
});

/** Use at the top of every admin page, layout and server action. */
export async function requireUser(permission?: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user, permission)) redirect("/admin?error=forbidden");
  return user;
}

export type SignInResult = { ok: true } | { ok: false; message: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const generic = "That email and password combination didn't work.";
  const normalized = email.trim().toLowerCase();

  if (authDriver === "database") {
    const { prisma } = await import("@/lib/db/prisma");
    const profile = await prisma().profile.findUnique({
      where: { email: normalized },
      select: { id: true, active: true, role: true, credential: { select: { password_hash: true } } },
    });
    const valid = await verifyPassword(password, profile?.credential?.password_hash);
    if (!profile || !valid) return { ok: false, message: generic };
    const user = await loadStaffProfile(profile.id);
    if (!user) return { ok: false, message: "This account doesn't have admin access. Ask an admin to activate it." };
    await setSessionCookie(user);
    return { ok: true };
  }

  const env = serverEnv();
  const emailOk = safeEqual(normalized, env.demoAdminEmail.toLowerCase());
  const passwordOk = safeEqual(password, env.demoAdminPassword);
  if (!emailOk || !passwordOk) return { ok: false, message: generic };

  const { LOCAL_ADMIN_ID } = await import("@/lib/data/constants");
  await setSessionCookie({ id: LOCAL_ADMIN_ID, email: env.demoAdminEmail, name: "Studio Admin", role: "admin" });
  return { ok: true };
}

/** Signs a user in after a successful password reset (database driver only). */
export async function startSessionFor(profileId: string): Promise<boolean> {
  const user = await loadStaffProfile(profileId);
  if (!user) return false;
  await setSessionCookie(user);
  return true;
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
