"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, fieldAria } from "@/components/ui/field";
import { loginAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/data/types";

const initial: ActionState = { status: "idle" };

export function LoginForm({ next, canRecover, demoHint }: { next: string; canRecover: boolean; demoHint: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const errors = state.fieldErrors ?? {};
  // React 19 resets uncontrolled fields after an action; keep the email across failed attempts.
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.status === "error" && state.message && <Alert tone="danger">{state.message}</Alert>}
      {demoHint && (
        <Alert tone="info" title="Demo environment">
          Use the credentials from <code>DEMO_ADMIN_EMAIL</code> / <code>DEMO_ADMIN_PASSWORD</code> (see README).
        </Alert>
      )}
      <Field id="email" label="Email" required error={errors.email}>
        <Input {...fieldAria("email", errors.email)} name="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field id="password" label="Password" required error={errors.password}>
        <Input {...fieldAria("password", errors.password)} name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending} loadingText="Signing in…">
        Sign in
      </Button>
      {canRecover && (
        <p className="text-center text-sm">
          <Link href="/admin/forgot-password" className="font-medium text-brand underline-offset-4 hover:underline">
            Forgot your password?
          </Link>
        </p>
      )}
    </form>
  );
}
