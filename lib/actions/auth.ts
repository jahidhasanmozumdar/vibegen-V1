"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { hashPassword, hashToken, newResetToken } from "@/lib/auth/password";
import { authDriver, signIn, signOut, startSessionFor } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import type { ActionState } from "@/lib/data/types";
import { RATE_LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { getRequestContext } from "@/lib/security/request";
import { emailField, fieldErrors, loginSchema } from "@/lib/validation/schemas";

const RESET_TTL_MS = 60 * 60 * 1000; // reset links are valid for one hour

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  // Only allow internal admin paths to prevent open redirects.
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { ip } = await getRequestContext();
  const limit = rateLimit(`login:${ip}`, RATE_LIMITS.login);
  if (!limit.ok) return { status: "error", message: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", message: "Enter your email and password.", fieldErrors: fieldErrors(parsed.error) };

  const result = await signIn(parsed.data.email, parsed.data.password);
  if (!result.ok) return { status: "error", message: result.message };

  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}

export async function requestPasswordResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { ip } = await getRequestContext();
  if (!rateLimit(`reset:${ip}`, RATE_LIMITS.form).ok) return { status: "error", message: "Too many requests. Try again later." };

  const parsed = z.object({ email: emailField }).safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), message: "Enter a valid email address." };

  if (authDriver !== "database") {
    return { status: "error", message: "Password recovery needs a database. In demo mode, set DEMO_ADMIN_PASSWORD in your environment instead." };
  }

  const { prisma } = await import("@/lib/db/prisma");
  const db = prisma();
  const profile = await db.profile.findUnique({ where: { email: parsed.data.email.trim().toLowerCase() }, select: { id: true, active: true, email: true } });

  if (profile?.active) {
    const { token, tokenHash } = newResetToken();
    await db.passwordResetToken.create({ data: { profile_id: profile.id, token_hash: tokenHash, expires_at: new Date(Date.now() + RESET_TTL_MS) } });
    const link = `${publicEnv.siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`;
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: profile.email,
      subject: "Reset your VibeGen admin password",
      text: `Someone asked to reset the password for this VibeGen admin account.\n\nChoose a new password (link valid for 1 hour):\n${link}\n\nIf this wasn't you, ignore this email. Your password won't change.`,
      html: `<p>Someone asked to reset the password for this VibeGen admin account.</p><p><a href="${link}">Choose a new password</a> (valid for 1 hour).</p><p>If this wasn't you, ignore this email. Your password won't change.</p>`,
    }).catch((err) => console.error("[auth] reset email failed:", err instanceof Error ? err.message : err));
  }

  // Same response whether or not the account exists, to avoid account enumeration.
  return { status: "success", message: "If that email belongs to an admin account, a reset link is on its way." };
}

export async function updatePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (authDriver !== "database") return { status: "error", message: "Password changes need a database." };

  const parsed = z
    .object({
      token: z.string().min(20).max(200),
      password: z.string().min(10, "Use at least 10 characters.").max(200),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { message: "Passwords don't match.", path: ["confirm"] })
    .safeParse({ token: formData.get("token"), password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    const errs = fieldErrors(parsed.error);
    if (errs.token) return { status: "error", message: "That reset link has expired. Request a new one." };
    return { status: "error", fieldErrors: errs, message: "Check the highlighted fields." };
  }

  const { prisma } = await import("@/lib/db/prisma");
  const db = prisma();
  const record = await db.passwordResetToken.findUnique({ where: { token_hash: hashToken(parsed.data.token) } });
  if (!record || record.used_at || record.expires_at.getTime() < Date.now()) {
    return { status: "error", message: "That reset link has expired. Request a new one." };
  }

  const password_hash = await hashPassword(parsed.data.password);
  await db.$transaction([
    db.adminCredential.upsert({ where: { profile_id: record.profile_id }, create: { profile_id: record.profile_id, password_hash }, update: { password_hash } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { used_at: new Date() } }),
    // Any other outstanding links for this account stop working too.
    db.passwordResetToken.updateMany({ where: { profile_id: record.profile_id, used_at: null }, data: { used_at: new Date() } }),
  ]);

  if (!(await startSessionFor(record.profile_id))) redirect("/admin/login");
  redirect("/admin");
}
