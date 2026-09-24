"use client";

import { useState } from "react";

import { Field, Input, fieldAria } from "@/components/ui/field";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Title + slug pair. On new records the slug follows the title until someone
 * edits it by hand; on existing records it never changes on its own, because
 * that would silently break the public URL.
 */
export function TitleSlugFields({
  defaultTitle = "",
  defaultSlug = "",
  titleLabel = "Title",
  prefix,
  errors = {},
  onTitleChange,
}: {
  defaultTitle?: string;
  defaultSlug?: string;
  titleLabel?: string;
  /** Public path prefix shown before the slug, e.g. "/blog/". */
  prefix: string;
  errors?: Record<string, string[] | undefined>;
  onTitleChange?: (title: string) => void;
}) {
  const isExisting = Boolean(defaultSlug);
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [manual, setManual] = useState(isExisting);

  return (
    <>
      <Field id="title" label={titleLabel} required error={errors.title}>
        <Input
          {...fieldAria("title", errors.title)}
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            onTitleChange?.(e.target.value);
            if (!manual) setSlug(slugify(e.target.value));
          }}
          required
          maxLength={160}
          className="text-base! font-medium"
        />
      </Field>
      <Field
        id="slug"
        label="Slug"
        required
        error={errors.slug}
        hint={isExisting ? "Changing the slug changes the public URL. Old links will stop working." : "Generated from the title. Edit it to set your own."}
      >
        <div className="flex items-stretch overflow-hidden rounded-[12px] border border-[#d9dbe1] bg-white transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgb(10_108_255/0.14)]">
          <span className="flex shrink-0 items-center border-r border-hair bg-soft px-3 font-mono text-[12.5px] whitespace-nowrap text-fg-3">{prefix}</span>
          <Input
            {...fieldAria("slug", errors.slug, true)}
            name="slug"
            value={slug}
            onChange={(e) => {
              setManual(true);
              setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            onBlur={() => setSlug((s) => slugify(s))}
            required
            maxLength={120}
            className="rounded-none! border-0! font-mono text-sm! focus:shadow-none!"
          />
        </div>
      </Field>
    </>
  );
}
