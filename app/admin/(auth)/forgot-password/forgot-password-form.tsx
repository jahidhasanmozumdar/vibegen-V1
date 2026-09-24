"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, fieldAria } from "@/components/ui/field";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/data/types";

const initial: ActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="mt-8 space-y-5">
        <Alert tone="success" title="Check your inbox">
          {state.message}
        </Alert>
        <p className="text-sm text-fg-2">The link expires after an hour. If nothing arrives, check spam or try again.</p>
        <Link href="/admin/login" className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      {state.status === "error" && state.message && <Alert tone="danger">{state.message}</Alert>}
      <Field id="email" label="Email" required error={errors.email}>
        <Input {...fieldAria("email", errors.email)} name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending} loadingText="Sending…">
        Send reset link
      </Button>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="font-medium text-brand underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
