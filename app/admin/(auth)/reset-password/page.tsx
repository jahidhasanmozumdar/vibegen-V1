import type { Metadata } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { authDriver } from "@/lib/auth/session";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

/** Reached from the emailed reset link: /admin/reset-password?token=… (valid 1 hour, single use). */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";

  return (
    <>
      <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.03em]">Choose a new password</h1>
      <p className="mt-1.5 text-[14px] text-fg-2">You&apos;ll be signed in once it&apos;s saved.</p>
      {authDriver === "local" ? (
        <div className="mt-8 space-y-5">
          <Alert tone="info" title="Needs a database">
            In demo mode the admin password is set with the <code>DEMO_ADMIN_PASSWORD</code> environment variable. Set <code>DATABASE_URL</code> to enable password resets.
          </Alert>
          <Link href="/admin/login" className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">
            ← Back to sign in
          </Link>
        </div>
      ) : !value ? (
        <div className="mt-8 space-y-5">
          <Alert tone="danger">This page needs the link from your reset email.</Alert>
          <Link href="/admin/forgot-password" className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">
            Request a reset link
          </Link>
        </div>
      ) : (
        <ResetPasswordForm token={value} />
      )}
    </>
  );
}
