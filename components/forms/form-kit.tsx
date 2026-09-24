"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/data/types";
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/security/spam";
import { getAttributionPayload } from "@/lib/tracking/attribution";
import { track, type TrackParams } from "@/lib/tracking/events";

/**
 * Honeypot + render timestamp. The timestamp is set on the client after
 * mount, so statically rendered pages don't ship a stale build-time value.
 */
export function SpamGuard() {
  // First render time is kept across form resets: a retry after a failed
  // submit must not look like a brand-new (too fast) or empty submission.
  const ref = useClientValue(() => String(Date.now()));
  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={ref} type="hidden" name={TIMESTAMP_FIELD} defaultValue="" />
    </>
  );
}

/** Hidden JSON of first/last touch attribution captured by AttributionCapture. */
export function AttributionField() {
  const ref = useClientValue(getAttributionPayload);
  return <input ref={ref} type="hidden" name="attribution" defaultValue="" />;
}

/**
 * Supplies a client-only value for a hidden field, computed once after mount.
 *
 * Forms get reset or re-rendered after failed submissions (React 19 resets
 * forms after actions), which can wipe a hidden input. So besides writing the
 * input, we inject the value on the form's `formdata` event, which fires
 * whenever FormData is built from the form — native submit, React actions or
 * `new FormData(form)`. The value is therefore always present on submit.
 */
function useClientValue(compute: () => string) {
  const ref = useRef<HTMLInputElement>(null);
  const computeRef = useRef(compute);
  useEffect(() => {
    const input = ref.current;
    const form = input?.form;
    if (!input || !form) return;
    const value = computeRef.current();
    const name = input.name;
    input.value = value;
    const onFormData = (e: FormDataEvent) => e.formData.set(name, value);
    form.addEventListener("formdata", onFormData);
    return () => form.removeEventListener("formdata", onFormData);
  }, []);
  return ref;
}

/** Fires form_start once on first interaction and form_error when validation fails. */
export function useFormTracking(formName: string, state: ActionState<unknown>) {
  const started = useRef(false);
  const onFocusCapture = () => {
    if (started.current) return;
    started.current = true;
    track("form_start", { form: formName });
  };

  useEffect(() => {
    if (state.status === "error") {
      const fields = Object.keys(state.fieldErrors ?? {}).join(",");
      track("form_error", { form: formName, fields: fields || "general" } satisfies TrackParams);
    }
  }, [state, formName]);

  return { onFocusCapture };
}

export function SubmitButton({ children, pendingText = "Sending…", className }: { children: ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} loadingText={pendingText} className={className}>
      {children}
      {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
    </Button>
  );
}

export function FormErrorSummary({ state }: { state: ActionState<unknown> }) {
  if (state.status !== "error" || !state.message) return null;
  return (
    <div role="alert" className="flex gap-3 rounded-[14px] bg-[#fef3f2] p-4 shadow-[inset_0_0_0_1px_#fecdca] sm:p-5">
      <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-[#b42318] text-[13px] font-semibold text-white">
        !
      </span>
      <div className="min-w-0">
        <p className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-fg">We couldn&apos;t send that yet.</p>
        <p className="mt-1 text-[14.5px] leading-relaxed text-fg-2">{state.message}</p>
      </div>
    </div>
  );
}

/** Scroll the first invalid field into view and focus it after a failed submit. */
export function useFocusFirstError(state: ActionState<unknown>, formRef: React.RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    if (state.status !== "error") return;
    const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    first?.focus({ preventScroll: false });
  }, [state, formRef]);
}

/** Calm success panel shown after a form sends (contact, call request). */
export function FormSuccess({
  ref,
  title,
  message,
  children,
  headingLevel = "h2",
}: {
  ref: React.Ref<HTMLDivElement>;
  title: string;
  message?: string;
  children?: ReactNode;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <div ref={ref} tabIndex={-1} role="status" className="py-6 text-center outline-none sm:py-10">
      <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-[#e7f6ec] text-[#12a150]">
        <svg viewBox="0 0 24 24" className="size-7" fill="none">
          <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <Heading className="mt-6 text-[26px] leading-tight font-semibold tracking-[-0.03em] text-fg">{title}</Heading>
      {message && <p className="mx-auto mt-3 max-w-md text-[15.5px] leading-relaxed text-fg-2">{message}</p>}
      {children}
    </div>
  );
}
