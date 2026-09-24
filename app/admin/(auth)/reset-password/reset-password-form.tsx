"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, fieldAria } from "@/components/ui/field";
import { updatePasswordAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/data/types";

const initial: ActionState = { status: "idle" };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);
  const [password, setPassword] = useState("");
  const errors = state.fieldErrors ?? {};
  const long = password.length >= 10;

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      {state.status === "error" && state.message && (
        <Alert tone="danger">
          {state.message}{" "}
          {state.message.includes("expired") && (
            <Link href="/admin/forgot-password" className="font-medium underline">
              Request a new link
            </Link>
          )}
        </Alert>
      )}
      <Field id="password" label="New password" required hint="At least 10 characters. A short phrase is easier to remember." error={errors.password}>
        <Input
          {...fieldAria("password", errors.password, true)}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <p className={long ? "text-[13px] text-success" : "text-[13px] text-fg-2"} aria-live="polite">
        {long ? "✓ Long enough" : `${Math.max(0, 10 - password.length)} more characters needed`}
      </p>
      <Field id="confirm" label="Confirm new password" required error={errors.confirm}>
        <Input {...fieldAria("confirm", errors.confirm)} name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending} loadingText="Saving…">
        Save new password
      </Button>
    </form>
  );
}
