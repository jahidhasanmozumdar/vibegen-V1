"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";

import { AttributionField, FormErrorSummary, SpamGuard, useFocusFirstError, useFormTracking } from "@/components/forms/form-kit";
import { ConsentField, FormSection, ServicesField, useActionSubmit } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { submitGrowthAuditAction } from "@/lib/actions/public-forms";
import f from "./forms.module.css";
import type { ActionState } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";
import { adSpendLabels, countryOptions, industryOptions, platformLabels, toOptions } from "@/lib/data/labels";

const initialState: ActionState = { status: "idle" };

const countrySelect = countryOptions.map((c) => ({ value: c, label: c }));
const industrySelect = industryOptions.map((i) => ({ value: i, label: i }));
const adSpendSelect = toOptions(adSpendLabels);
const platformSelect = toOptions(platformLabels);

const STEPS = ["About you", "Your business", "Your advertising", "What you need"] as const;

/** Which steps have every required control filled, and which one has focus. */
function readProgress(form: HTMLFormElement, focused: Element | null) {
  const done = STEPS.map((_, i) => {
    const set = form.querySelector<HTMLFieldSetElement>(`fieldset[data-step="${i + 1}"]`);
    if (!set) return false;
    const required = Array.from(set.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[required]"));
    const fieldsOk = required.every((el) => (el instanceof HTMLInputElement && el.type === "checkbox" ? el.checked : el.value.trim() !== ""));
    const services = set.querySelectorAll<HTMLInputElement>("input[name=services]");
    const servicesOk = services.length === 0 || Array.from(services).some((el) => el.checked);
    return fieldsOk && servicesOk;
  });
  const active = focused?.closest("fieldset[data-step]")?.getAttribute("data-step");
  return { done, active: active ? Number(active) : null };
}

/** Sticky four-step progress bar at the top of the form card (sits below the 64px site header). */
function StepProgress({ done, active }: { done: boolean[]; active: number | null }) {
  const complete = done.filter(Boolean).length;
  return (
    <div className="sticky top-16 z-10 -mx-5 -mt-5 rounded-t-[24px] border-b border-hair bg-white/95 px-5 pt-5 pb-4 backdrop-blur sm:-mx-8 sm:-mt-7 sm:px-8 sm:pt-6">
      <p className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-medium text-fg">Your audit request</span>
        <span aria-live="polite" className="text-fg-3 tabular-nums">
          {complete} of {STEPS.length} steps done
        </span>
      </p>
      <ol className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
        {STEPS.map((label, i) => {
          const isDone = done[i];
          const isActive = active === i + 1;
          return (
            <li key={label} className="min-w-0">
              <a
                href={`#step-${i + 1}`}
                className={cn("block h-1.5 rounded-full transition-colors duration-200", isDone ? "bg-brand" : isActive ? "bg-fg" : "bg-soft-2")}
              >
                <span className="sr-only">
                  Step {i + 1}: {label}
                  {isDone ? " (complete)" : ""}
                </span>
              </a>
              <span aria-hidden="true" className={cn("mt-2 hidden items-center gap-1 truncate text-[12.5px] sm:flex", isActive || isDone ? "font-medium text-fg" : "text-fg-3")}>
                {isDone ? <Check className="size-3.5 shrink-0 text-brand" strokeWidth={2.5} /> : <span className="tabular-nums">{i + 1}.</span>}
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * §17 — the Free Growth Audit request. Field names mirror growthAuditSchema.
 * On success the server action redirects to /free-growth-audit/thank-you,
 * where the conversion event fires.
 */
export function GrowthAuditForm() {
  const [state, formAction, pending] = useActionState(submitGrowthAuditAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { onFocusCapture } = useFormTracking("growth_audit", state);
  useFocusFirstError(state, formRef);

  // Arriving from the homepage Instant Funnel Scan: carry the scanned site over.
  useEffect(() => {
    const site = new URLSearchParams(window.location.search).get("website");
    const input = formRef.current?.querySelector<HTMLInputElement>("input[name=website]");
    if (site && input && !input.value) input.value = site.slice(0, 300);
  }, []);
  const onSubmit = useActionSubmit(formAction, pending, state);
  const [progress, setProgress] = useState<{ done: boolean[]; active: number | null }>({ done: STEPS.map(() => false), active: null });
  const refresh = useCallback(() => {
    const form = formRef.current;
    if (form) setProgress(readProgress(form, document.activeElement));
  }, []);

  const e = state.fieldErrors ?? {};
  const id = (name: string) => `ga-${name}`;

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      onFocusCapture={() => {
        onFocusCapture();
        refresh();
      }}
      onChange={refresh}
      onInput={refresh}
      noValidate
      aria-describedby="ga-required-note"
      className={cn(f.form, "relative space-y-8")}
    >
      <SpamGuard />
      <AttributionField />

      <StepProgress done={progress.done} active={progress.active} />

      <p id="ga-required-note" className="text-[14px] text-fg-3">
        Fields marked <span className="font-medium text-[#b42318]">*</span> are required. Four short steps, about two minutes.
      </p>

      <FormErrorSummary state={state} />

      <FormSection step={1} legend="About you">
        <Field id={id("full_name")} label="Full name" required error={e.full_name}>
          <Input {...fieldAria(id("full_name"), e.full_name)} name="full_name" autoComplete="name" placeholder="Jordan Lee" required maxLength={120} />
        </Field>
        <Field id={id("email")} label="Work email" required error={e.email} hint="We'll send the audit here.">
          <Input {...fieldAria(id("email"), e.email, true)} name="email" type="email" inputMode="email" autoComplete="email" placeholder="jordan@company.com" required maxLength={254} />
        </Field>
      </FormSection>

      <FormSection step={2} legend="Your business">
        <Field id={id("company")} label="Company" required error={e.company}>
          <Input {...fieldAria(id("company"), e.company)} name="company" autoComplete="organization" placeholder="Acme Roofing" required maxLength={160} />
        </Field>
        <Field id={id("website")} label="Website URL" required error={e.website} hint="The site or landing page your ads send traffic to.">
          <Input {...fieldAria(id("website"), e.website, true)} name="website" type="text" inputMode="url" autoComplete="url" placeholder="acme.com" required maxLength={300} />
        </Field>
        <Field id={id("country")} label="Country" required error={e.country}>
          <Select {...fieldAria(id("country"), e.country)} name="country" autoComplete="country-name" options={countrySelect} placeholder="Select country" defaultValue="" required />
        </Field>
        <Field id={id("industry")} label="Industry" required error={e.industry}>
          <Select {...fieldAria(id("industry"), e.industry)} name="industry" options={industrySelect} placeholder="Select industry" defaultValue="" required />
        </Field>
      </FormSection>

      <FormSection step={3} legend="Your advertising">
        <Field id={id("monthly_ad_spend")} label="Monthly ad spend" required error={e.monthly_ad_spend} hint="A rough range is fine.">
          <Select {...fieldAria(id("monthly_ad_spend"), e.monthly_ad_spend, true)} name="monthly_ad_spend" options={adSpendSelect} placeholder="Select a range" defaultValue="" required />
        </Field>
        <Field id={id("primary_platform")} label="Primary platform" required error={e.primary_platform}>
          <Select {...fieldAria(id("primary_platform"), e.primary_platform)} name="primary_platform" options={platformSelect} placeholder="Select platform" defaultValue="" required />
        </Field>
        <Field id={id("challenge")} label="Current challenge" required error={e.challenge} hint="A sentence or two is enough. What's not working, or what you want to improve?" className="sm:col-span-2">
          <Textarea
            {...fieldAria(id("challenge"), e.challenge, true)}
            name="challenge"
            rows={4}
            required
            maxLength={1500}
            placeholder="e.g. Our Google Ads get clicks but very few quote requests, and we're not sure the conversion tracking is right."
          />
        </Field>
      </FormSection>

      <FormSection step={4} legend="What you need">
        <ServicesField idPrefix="ga" legend="Services needed" required error={e.services} />
        <Field id={id("message")} label="Additional message" error={e.message} className="sm:col-span-2">
          <Textarea {...fieldAria(id("message"), e.message)} name="message" rows={3} maxLength={2000} placeholder="Anything else we should know: timelines, past agencies, what you've already tried." />
        </Field>
        <ConsentField
          id={id("consent")}
          error={e.consent}
          label={
            <>
              I&apos;m happy for VibeGen to contact me about this audit request. See our{" "}
              <Link href="/privacy">privacy policy</Link>
              .<span className="ml-0.5 text-[#b42318]" aria-hidden="true">*</span>
            </>
          }
        />
      </FormSection>

      <div className="border-t border-hair pt-7">
        <Button type="submit" size="lg" loading={pending} loadingText="Sending request…" className="h-13 w-full text-[16px]">
          Request My Growth Audit
          {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
        <p className="mt-4 flex items-start justify-center gap-2 text-center text-[13.5px] leading-relaxed text-fg-3">
          <Lock className="mt-[3px] size-4 shrink-0" aria-hidden="true" />
          <span>Free, no obligation, no spam. Written reply within two business days. We never ask for passwords.</span>
        </p>
      </div>
    </form>
  );
}
