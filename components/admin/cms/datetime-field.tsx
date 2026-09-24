"use client";

import { useState, useSyncExternalStore } from "react";

import { Field, Input, fieldAria } from "@/components/ui/field";

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string): string {
  if (!local) return "";
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

const subscribe = () => () => {};

/**
 * Date/time picker in the editor's local timezone that submits an ISO
 * timestamp (hidden input), so the server never guesses a timezone.
 * The visible input renders after mount to avoid server/client TZ mismatch.
 */
export function DateTimeField({
  name,
  label,
  defaultValue,
  error,
  hint,
  required,
}: {
  name: string;
  label: string;
  defaultValue: string | null | undefined;
  error?: string[];
  hint?: string;
  required?: boolean;
}) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [local, setLocal] = useState<string | null>(null);
  const shown = local ?? (mounted ? toLocalInput(defaultValue) : "");
  const iso = local === null ? (defaultValue ?? "") : toIso(local);
  const id = `${name}-local`;

  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <input type="hidden" name={name} value={iso} />
      {mounted ? (
        <Input {...fieldAria(id, error, Boolean(hint))} type="datetime-local" value={shown} onChange={(e) => setLocal(e.target.value)} />
      ) : (
        <div className="skeleton h-11 rounded-md" aria-hidden="true" />
      )}
    </Field>
  );
}
