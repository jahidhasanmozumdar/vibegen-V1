import type { Metadata } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { authDriver } from "@/lib/auth/session";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage(props: PageProps<"/admin/forgot-password">) {
  const { error } = await props.searchParams;
  return (
    <>
      <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.03em]">Reset your password</h1>
      <p className="mt-1.5 text-[14px] text-fg-2">Enter your admin email and we&apos;ll send you a link to choose a new password.</p>
      {error === "link_expired" && (
        <Alert tone="warning" className="mt-6">
          That reset link has expired or was already used. Request a new one below.
        </Alert>
      )}
      {authDriver === "local" ? (
        <div className="mt-8 space-y-5">
          <Alert tone="info" title="Password recovery needs a database">
            This workspace runs on the local demo driver. The admin password comes from the <code>DEMO_ADMIN_PASSWORD</code> environment variable — change it there and restart.
          </Alert>
          <Link href="/admin/login" className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <ForgotPasswordForm />
      )}
    </>
  );
}
