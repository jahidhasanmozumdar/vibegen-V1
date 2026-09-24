"use client";

import { useId, useState } from "react";

import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils/cn";
import { Markdown, readingMinutes } from "@/lib/utils/markdown";

const CHEATSHEET: [string, string][] = [
  ["## Heading", "Section heading"],
  ["### Subheading", "Smaller heading"],
  ["**bold**  *italic*", "Emphasis"],
  ["[link text](https://…)", "Link (or /internal-path)"],
  ["- item", "Bulleted list"],
  ["1. item", "Numbered list"],
  ["> quote", "Pull quote"],
  ["`code`", "Inline code"],
  ["---", "Divider"],
];

/**
 * Markdown textarea with a live preview rendered by the same component the
 * public site uses, so what you see is what gets published. Raw HTML is
 * never rendered.
 */
export function MarkdownEditor({
  name,
  label,
  defaultValue = "",
  error,
  required,
  rows = 22,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string[];
  required?: boolean;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const id = useId();
  const words = value.split(/\s+/).filter(Boolean).length;
  const message = error?.[0];

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-end justify-between gap-2">
        <label htmlFor={`${id}-input`} className="text-sm font-medium text-fg">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div role="tablist" aria-label={`${label} editor mode`} className="inline-flex gap-0.5 rounded-full bg-[#efeee9] p-0.5">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              aria-controls={`${id}-${t}`}
              onClick={() => setTab(t)}
              className={cn("rounded-full px-3 py-0.5 text-[13px] font-medium capitalize transition-colors", tab === t ? "bg-white text-fg shadow-[0_0_0_1px_#e8e8ec]" : "text-fg-2 hover:text-fg")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div id={`${id}-write`} role="tabpanel" hidden={tab !== "write"}>
        <Textarea
          id={`${id}-input`}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
          required={required}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${id}-error` : `${id}-meta`}
          spellCheck
          className="min-h-[28rem] font-mono text-[13.5px]! leading-6!"
        />
      </div>
      {tab === "preview" && (
        <div id={`${id}-preview`} role="tabpanel" className="min-h-[28rem] rounded-[10px] border border-hair bg-white px-6 py-5">
          {value.trim() ? (
            <div className="prose-vg max-w-none">
              <Markdown source={value} />
            </div>
          ) : (
            <p className="text-sm text-fg-2">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {message ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] font-medium text-danger">
          {message}
        </p>
      ) : (
        <p id={`${id}-meta`} className="tabular mt-1.5 text-[13px] text-fg-2">
          {words.toLocaleString("en-US")} words · about {readingMinutes(value)} min read
        </p>
      )}

      <details className="mt-3 rounded-[10px] border border-hair bg-soft">
        <summary className="cursor-pointer px-3 py-2 text-[13px] font-medium text-fg-2 select-none hover:text-fg">Formatting cheat-sheet</summary>
        <dl className="grid gap-x-6 gap-y-1.5 border-t border-hair px-3 py-3 text-[13px] sm:grid-cols-2">
          {CHEATSHEET.map(([syntax, meaning]) => (
            <div key={syntax} className="flex items-baseline justify-between gap-3">
              <dt className="font-mono text-fg">{syntax}</dt>
              <dd className="text-fg-2">{meaning}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-hair px-3 py-2 text-xs text-fg-2">HTML is not supported and is shown as plain text.</p>
      </details>
    </div>
  );
}
