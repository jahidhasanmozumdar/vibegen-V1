"use client";

import { startTransition, useEffect, useRef, type FormEvent, type ReactNode } from "react";

import { Checkbox } from "@/components/ui/field";
import { SERVICE_SLUGS } from "@/lib/data/types";
import { serviceLabels } from "@/lib/data/labels";
import { cn } from "@/lib/utils/cn";
import f from "./forms.module.css";

/**
 * Submit handler for `useActionState` forms. Dispatching the action manually
 * (instead of via `<form action>`) keeps what the visitor typed when the
 * server returns validation errors, and the ref blocks double submits in the
 * gap before `pending` re-renders the disabled button.
 */
export function useActionSubmit(formAction: (formData: FormData) => void, pending: boolean, stateKey: unknown) {
  const inFlight = useRef(false);
  useEffect(() => {
    if (!pending) inFlight.current = false;
  }, [pending, stateKey]);

  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || inFlight.current) return;
    inFlight.current = true;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}

/**
 * A titled group of related fields: a numbered step dot plus the legend
 * ("1 · About you"), then a two-column field grid. `data-step` lets the
 * audit form's progress bar find it.
 */
export function FormSection({
  legend,
  step,
  description,
  children,
  className,
}: {
  legend: string;
  step?: number;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset
      id={step !== undefined ? `step-${step}` : undefined}
      data-step={step}
      className={cn("min-w-0 scroll-mt-40 border-t border-hair pt-8 first-of-type:border-t-0 first-of-type:pt-0", className)}
    >
      <legend className="float-left flex w-full items-center gap-3 text-[17px] leading-tight font-semibold tracking-[-0.02em] text-fg">
        {step !== undefined && (
          <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-fg text-[13px] font-medium text-white tabular-nums">
            {step}
          </span>
        )}
        {step !== undefined && <span className="sr-only">Step {step}: </span>}
        {legend}
      </legend>
      {description && <p className="clear-left pt-2 text-[14px] text-fg-3">{description}</p>}
      <div className="clear-left grid gap-x-4 gap-y-5 pt-6 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-1.5 text-[13px] font-medium text-[#b42318]">
      <svg className="mt-0.5 size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.8v3.6M8 10.9v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {message}
    </p>
  );
}

const serviceHints: Record<(typeof SERVICE_SLUGS)[number], string> = {
  "meta-ads": "Facebook & Instagram",
  "google-ads": "Search & remarketing",
  "landing-pages": "Campaign pages",
  cro: "Conversion rate optimization",
  analytics: "GA4, GTM, Pixel, conversions",
};

/** Checkbox group posting repeated `services` values (service slugs). */
export function ServicesField({
  idPrefix,
  legend,
  required,
  error,
  className,
}: {
  idPrefix: string;
  legend: string;
  required?: boolean;
  error?: string[];
  className?: string;
}) {
  const message = error?.[0];
  const errorId = `${idPrefix}-services-error`;
  return (
    <fieldset className={cn("min-w-0 sm:col-span-2", className)} aria-describedby={message ? errorId : undefined}>
      <legend className="mb-2.5 text-[14px] font-medium text-fg">
        {legend}
        {required ? (
          <span className="ml-0.5 text-[#b42318]" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-[12.5px] font-normal text-fg-3">Optional</span>
        )}
        <span className="ml-1.5 font-normal text-fg-3">· choose all that apply</span>
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {SERVICE_SLUGS.map((slug, i) => (
          <Checkbox
            key={slug}
            id={i === 0 ? `${idPrefix}-services` : undefined}
            name="services"
            value={slug}
            label={<span className="font-medium text-fg">{serviceLabels[slug]}</span>}
            description={serviceHints[slug]}
            aria-invalid={message ? true : undefined}
            className={f.tile}
          />
        ))}
      </div>
      <ErrorText id={errorId} message={message} />
    </fieldset>
  );
}

/** Required consent checkbox (`consent=on`). */
export function ConsentField({ id, label, error }: { id: string; label: ReactNode; error?: string[] }) {
  const message = error?.[0];
  return (
    <div className="sm:col-span-2">
      <Checkbox
        id={id}
        name="consent"
        value="on"
        required
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${id}-error` : undefined}
        label={label}
        className={f.consent}
      />
      <ErrorText id={`${id}-error`} message={message} />
    </div>
  );
}
