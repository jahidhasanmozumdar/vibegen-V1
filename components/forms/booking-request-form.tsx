"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

import { AttributionField, FormErrorSummary, FormSuccess, SpamGuard, useFocusFirstError, useFormTracking } from "@/components/forms/form-kit";
import { ConsentField, FormSection, useActionSubmit } from "@/components/forms/form-fields";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea, fieldAria } from "@/components/ui/field";
import { submitBookingRequestAction } from "@/lib/actions/public-forms";
import f from "./forms.module.css";
import type { ActionState } from "@/lib/data/types";
import { track } from "@/lib/tracking/events";

const initialState: ActionState = { status: "idle" };

/**
 * Shown on /book-a-call when no booking provider is configured. It requests
 * a call; a person confirms the time by email. No fake availability.
 * Field names mirror bookingRequestSchema.
 */
export function BookingRequestForm() {
  const [state, formAction, pending] = useActionState(submitBookingRequestAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { onFocusCapture } = useFormTracking("booking_request", state);
  useFocusFirstError(state, formRef);
  const onSubmit = useActionSubmit(formAction, pending, state);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    track("booking_request_submit", { form: "booking_request" });
    successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <FormSuccess ref={successRef} title="Call request received." message={state.message} headingLevel="h3">
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-fg-2">
          Nothing is booked until you get that email. If you want us to look at your funnel before we talk, request the audit too. It makes the call more useful.
        </p>
        <div className="mt-7">
          <ButtonLink href="/free-growth-audit" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
            Get a Free Growth Audit
          </ButtonLink>
        </div>
      </FormSuccess>
    );
  }

  const e = state.fieldErrors ?? {};
  const id = (name: string) => `bk-${name}`;

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} onFocusCapture={onFocusCapture} noValidate className={`${f.form} relative space-y-8`}>
      <SpamGuard />
      <AttributionField />

      <FormErrorSummary state={state} />

      <FormSection step={1} legend="About you">
        <Field id={id("name")} label="Name" required error={e.name}>
          <Input {...fieldAria(id("name"), e.name)} name="name" autoComplete="name" placeholder="Jordan Lee" required maxLength={120} />
        </Field>
        <Field id={id("email")} label="Work email" required error={e.email}>
          <Input {...fieldAria(id("email"), e.email)} name="email" type="email" inputMode="email" autoComplete="email" placeholder="jordan@company.com" required maxLength={254} />
        </Field>
        <Field id={id("company")} label="Company" error={e.company}>
          <Input {...fieldAria(id("company"), e.company)} name="company" autoComplete="organization" placeholder="Acme Inc." maxLength={160} />
        </Field>
        <Field id={id("website")} label="Website" error={e.website}>
          <Input {...fieldAria(id("website"), e.website)} name="website" type="text" inputMode="url" autoComplete="url" placeholder="acme.com" maxLength={300} />
        </Field>
      </FormSection>

      <FormSection step={2} legend="The call">
        <Field
          id={id("preferred_times")}
          label="Preferred days and times"
          error={e.preferred_times}
          hint="Include your time zone. We'll email to confirm a time."
          className="sm:col-span-2"
        >
          <Input
            {...fieldAria(id("preferred_times"), e.preferred_times, true)}
            name="preferred_times"
            placeholder="e.g. Tue or Thu afternoons, US Eastern"
            maxLength={500}
          />
        </Field>
        <Field id={id("topic")} label="What would you like to cover?" error={e.topic} className="sm:col-span-2">
          <Textarea
            {...fieldAria(id("topic"), e.topic)}
            name="topic"
            rows={4}
            maxLength={1500}
            placeholder="e.g. Our Meta ads cost per lead doubled in three months and we don't trust the numbers in GA4."
          />
        </Field>
        <ConsentField
          id={id("consent")}
          error={e.consent}
          label={
            <>
              I&apos;m happy for VibeGen to email me to arrange this call. See our{" "}
              <Link href="/privacy">privacy policy</Link>
              .<span className="ml-0.5 text-[#b42318]" aria-hidden="true">*</span>
            </>
          }
        />
      </FormSection>

      <div className="flex flex-col gap-4 border-t border-hair pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] leading-relaxed text-fg-3">This sends a request. We&apos;ll reply by email to confirm a time.</p>
        <Button type="submit" size="lg" loading={pending} loadingText="Sending…" className="w-full sm:w-auto">
          Submit Request
          {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
      </div>
    </form>
  );
}
