"use client";

import { useState } from "react";

import { Checkbox, Field, Input, Textarea, fieldAria } from "@/components/ui/field";
import type { SeoFields } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";
import { EditorSection } from "./content-form-shell";

type Errors = Record<string, string[] | undefined>;

function Counter({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return (
    <span className={cn("tabular text-xs", over ? "font-medium text-danger" : value.length > limit * 0.9 ? "text-warning" : "text-fg-3")}>
      {value.length} / {limit}
    </span>
  );
}

function CounterHint({ text, value, limit }: { text: string; value: string; limit: number }) {
  return (
    <span className="flex items-start justify-between gap-3">
      <span>{text}</span>
      <Counter value={value} limit={limit} />
    </span>
  );
}

/**
 * SEO fields shared by every CMS editor (§90): title + meta description with
 * length counters, canonical, Open Graph and noindex, plus a search preview.
 */
export function SeoFieldset({
  defaults,
  errors = {},
  fallbackTitle,
  fallbackDescription,
  path,
}: {
  defaults?: Partial<SeoFields>;
  errors?: Errors;
  /** Used in the preview when the SEO title/description are empty. */
  fallbackTitle?: string;
  fallbackDescription?: string;
  /** Public path shown in the preview, e.g. /blog/my-post */
  path?: string;
}) {
  const [title, setTitle] = useState(defaults?.seo_title ?? "");
  const [description, setDescription] = useState(defaults?.seo_description ?? "");
  const previewTitle = title || fallbackTitle || "Page title";
  const previewDescription = description || fallbackDescription || "Add a meta description so search results show a useful summary.";

  return (
    <EditorSection title="SEO" description="How this page appears in search results and when shared.">
      <div className="rounded-[10px] border border-hair bg-soft p-4" aria-label="Search result preview">
        <p className="truncate text-xs text-success">vibegen.studio{path ?? ""}</p>
        <p className="mt-0.5 truncate text-[17px] text-[#1a0dab]">{previewTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-fg-2">{previewDescription}</p>
      </div>

      <Field
        id="seo_title"
        label="SEO title"
        hint={<CounterHint text="Aim for 50–60 characters. Leave empty to use the page title." value={title} limit={60} />}
        error={errors.seo_title}
      >
        <Input {...fieldAria("seo_title", errors.seo_title, true)} name="seo_title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} />
      </Field>

      <Field
        id="seo_description"
        label="Meta description"
        hint={<CounterHint text="Aim for 140–160 characters. Say who it's for and what they get." value={description} limit={160} />}
        error={errors.seo_description}
      >
        <Textarea
          {...fieldAria("seo_description", errors.seo_description, true)}
          name="seo_description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={170}
          className="min-h-20"
        />
      </Field>

      <Field id="canonical_url" label="Canonical URL" hint="Only set this if the content lives at another URL first." error={errors.canonical_url}>
        <Input {...fieldAria("canonical_url", errors.canonical_url, true)} name="canonical_url" type="url" defaultValue={defaults?.canonical_url ?? ""} placeholder="https://" />
      </Field>

      <details className="group rounded-[10px] border border-hair">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-fg select-none">
          <span className="mr-1 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
            ›
          </span>
          Social sharing (Open Graph)
        </summary>
        <div className="space-y-5 border-t border-hair px-4 py-4">
          <Field id="og_title" label="OG title" error={errors.og_title}>
            <Input {...fieldAria("og_title", errors.og_title)} name="og_title" defaultValue={defaults?.og_title ?? ""} maxLength={100} />
          </Field>
          <Field id="og_description" label="OG description" error={errors.og_description}>
            <Textarea {...fieldAria("og_description", errors.og_description)} name="og_description" defaultValue={defaults?.og_description ?? ""} maxLength={200} className="min-h-20" />
          </Field>
          <Field id="og_image" label="OG image URL" hint="1200 × 630 px works everywhere." error={errors.og_image}>
            <Input {...fieldAria("og_image", errors.og_image, true)} name="og_image" type="url" defaultValue={defaults?.og_image ?? ""} placeholder="https://" />
          </Field>
        </div>
      </details>

      <Checkbox
        name="noindex"
        defaultChecked={defaults?.noindex ?? false}
        label="Hide from search engines (noindex)"
        description="The page stays public but asks search engines not to list it."
      />
    </EditorSection>
  );
}
