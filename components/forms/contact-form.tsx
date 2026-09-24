"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

import { AttributionField, FormErrorSummary, FormSuccess, SpamGuard, useFocusFirstError, useFormTracking } from "@/components/forms/form-kit";
import { FormSection, ServicesField, useActionSubmit } from "@/components/forms/form-fields";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { submitContactAction } from "@/lib/actions/public-forms";
import f from "./forms.module.css";
import type { ActionState } from "@/lib/data/types";
import { adSpendLabels, countryOptions, industryOptions, toOptions } from "@/lib/data/labels";
import { track } from "@/lib/tracking/events";

const initialState: ActionState = { status: "idle" };

const countrySelect = countryOptions.map((c) => ({ value: c, label: c }));
const industrySelect = industryOptions.map((i) => ({ value: i, label: i }));
const adSpendSelect = toOptions(adSpendLabels);

/** §18 — general contact form. Field names mirror contactSchema. */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { onFocusCapture } = useFormTracking("contact", state);
  useFocusFirstError(state, formRef);
  const onSubmit = useActionSubmit(formAction, pending, state);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    track("contact_submit", { form: "contact" });
    successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <FormSuccess ref={successRef} title="Message received." message={state.message} headingLevel="h2">
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-fg-2">
          If you&apos;d like a structured review of your ads, landing pages and tracking in the meantime, the free growth audit is the quickest way to get one.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-x-6 gap-y-3 sm:flex-row">
          <ButtonLink href="/free-growth-audit" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
            Get a Free Growth Audit
          </ButtonLink>
          <Link href="/blog" className="pm-link inline-flex h-10 items-center">
            Read the blog
          </Link>
        </div>
      </FormSuccess>
    );
  }

  const e = state.fieldErrors ?? {};
  const id = (name: string) => `ct-${name}`;

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} onFocusCapture={onFocusCapture} noValidate className={`${f.form} relative space-y-8`}>
      <SpamGuard />
      <AttributionField />

      <p className="text-[14px] leading-relaxed text-fg-3">
        Fields marked <span className="font-medium text-[#b42318]">*</span> are required.
      </p>

      <FormErrorSummary state={state} />

      <FormSection step={1} legend="Your details">
        <Field id={id("name")} label="Name" required error={e.name}>
          <Input {...fieldAria(id("name"), e.name)} name="name" autoComplete="name" placeholder="Jordan Lee" required maxLength={120} />
        </Field>
        <Field id={id("email")} label="Business email" required error={e.email}>
          <Input {...fieldAria(id("email"), e.email)} name="email" type="email" inputMode="email" autoComplete="email" placeholder="jordan@company.com" required maxLength={254} />
        </Field>
        <Field id={id("company")} label="Company" error={e.company}>
          <Input {...fieldAria(id("company"), e.company)} name="company" autoComplete="organization" placeholder="Acme Inc." maxLength={160} />
        </Field>
        <Field id={id("website")} label="Website" error={e.website}>
          <Input {...fieldAria(id("website"), e.website)} name="website" type="text" inputMode="url" autoComplete="url" placeholder="acme.com" maxLength={300} />
        </Field>
      </FormSection>

      <FormSection step={2} legend="Your business">
        <Field id={id("country")} label="Country" error={e.country}>
          <Select {...fieldAria(id("country"), e.country)} name="country" autoComplete="country-name" options={countrySelect} placeholder="Select country" defaultValue="" />
        </Field>
        <Field id={id("business_type")} label="Business type" error={e.business_type}>
          <Select {...fieldAria(id("business_type"), e.business_type)} name="business_type" options={industrySelect} placeholder="Select business type" defaultValue="" />
        </Field>
        <Field id={id("monthly_ad_spend")} label="Monthly ad spend" error={e.monthly_ad_spend} className="sm:col-span-2">
          <Select {...fieldAria(id("monthly_ad_spend"), e.monthly_ad_spend)} name="monthly_ad_spend" options={adSpendSelect} placeholder="Select a range" defaultValue="" />
        </Field>
        <ServicesField idPrefix="ct" legend="Services interested in" error={e.services} />
      </FormSection>

      <FormSection step={3} legend="Your message">
        <Field id={id("message")} label="Message" required error={e.message} className="sm:col-span-2">
          <Textarea
            {...fieldAria(id("message"), e.message)}
            name="message"
            rows={5}
            required
            maxLength={3000}
            placeholder="What would you like to talk about? A question about pricing, a project you're planning, or something specific about your campaigns."
          />
        </Field>
      </FormSection>

      <div className="flex flex-col gap-4 border-t border-hair pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] leading-relaxed text-fg-3">
          We use these details only to reply. See our{" "}
          <Link href="/privacy" className="pm-link">
            privacy policy
          </Link>
          .
        </p>
        <Button type="submit" size="lg" loading={pending} loadingText="Sending…" className="w-full sm:w-auto">
          Submit Request
          {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
      </div>
    </form>
  );
}
