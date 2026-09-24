"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils/cn";
import { useMarkDirty } from "./content-form-shell";

export interface RowField {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
  /** Serialize an empty value as null instead of "" (e.g. optional metric columns). */
  nullable?: boolean;
  /** Grid span on wide screens (out of 12). */
  span?: number;
}

type Values = Record<string, string>;
interface RowState {
  uid: number;
  values: Values;
}

/**
 * Repeatable structured rows (features, FAQs, metrics…). The whole list is
 * serialised as JSON into one hidden input named `name`, which the server
 * action parses with a Zod list schema.
 */
export function RepeatableRows({
  name,
  label,
  description,
  fields,
  initial,
  addLabel = "Add row",
  max = 20,
  error,
}: {
  name: string;
  label: string;
  description?: string;
  fields: RowField[];
  /** Existing rows; any object whose keys match `fields`. */
  initial: readonly object[];
  addLabel?: string;
  max?: number;
  error?: string[];
}) {
  const markDirty = useMarkDirty();
  const baseId = useId();
  const [nextUid, setNextUid] = useState(initial.length);
  const [rows, setRows] = useState<RowState[]>(() =>
    initial.map((row, i) => ({
      uid: i,
      values: Object.fromEntries(fields.map((f) => [f.key, String((row as Record<string, unknown>)[f.key] ?? "")])),
    })),
  );

  const serialized = JSON.stringify(
    rows.map((r) => Object.fromEntries(fields.map((f) => [f.key, f.nullable && !r.values[f.key].trim() ? null : r.values[f.key]]))),
  );

  function update(uid: number, key: string, value: string) {
    setRows((all) => all.map((r) => (r.uid === uid ? { ...r, values: { ...r.values, [key]: value } } : r)));
  }
  function add() {
    setRows((all) => [...all, { uid: nextUid, values: Object.fromEntries(fields.map((f) => [f.key, ""])) }]);
    setNextUid((n) => n + 1);
    markDirty();
  }
  function remove(uid: number) {
    setRows((all) => all.filter((r) => r.uid !== uid));
    markDirty();
  }
  function move(index: number, delta: -1 | 1) {
    setRows((all) => {
      const next = [...all];
      const target = index + delta;
      if (target < 0 || target >= next.length) return all;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    markDirty();
  }

  const message = error?.[0];
  const groupId = `${name}-group`;

  return (
    <fieldset aria-describedby={message ? `${name}-error` : undefined} className="min-w-0">
      <legend id={groupId} className="mb-1 text-sm font-medium text-fg">
        {label}
      </legend>
      {description && <p className="mb-3 text-[13px] text-fg-2">{description}</p>}
      <input type="hidden" name={name} value={serialized} />

      {rows.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-hair px-4 py-5 text-center text-sm text-fg-2">Nothing here yet.</p>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => (
            <li key={row.uid} className="rounded-[10px] border border-hair bg-soft p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="tabular text-xs font-medium text-fg-3">#{index + 1}</span>
                <div className="flex items-center gap-1">
                  <IconButton label={`Move row ${index + 1} up`} onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp className="size-3.5" />
                  </IconButton>
                  <IconButton label={`Move row ${index + 1} down`} onClick={() => move(index, 1)} disabled={index === rows.length - 1}>
                    <ArrowDown className="size-3.5" />
                  </IconButton>
                  <IconButton label={`Remove row ${index + 1}`} onClick={() => remove(row.uid)} danger>
                    <Trash2 className="size-3.5" />
                  </IconButton>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-12">
                {fields.map((f) => {
                  const id = `${baseId}-${row.uid}-${f.key}`;
                  const common = {
                    id,
                    value: row.values[f.key],
                    placeholder: f.placeholder,
                    onChange: (e: { target: { value: string } }) => update(row.uid, f.key, e.target.value),
                  };
                  return (
                    <div key={f.key} className={cn("min-w-0", spanClass(f.span ?? (f.multiline ? 12 : 12 / Math.min(fields.filter((x) => !x.multiline).length, 4))))}>
                      <label htmlFor={id} className="mb-1 block text-xs font-medium text-fg-2">
                        {f.label}
                      </label>
                      {f.multiline ? <Textarea {...common} className="min-h-20 text-sm!" /> : <Input {...common} className="h-9! text-sm!" />}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      )}

      {message && (
        <p id={`${name}-error`} role="alert" className="mt-2 text-[13px] font-medium text-danger">
          {message}
        </p>
      )}

      {rows.length < max && (
        <Button variant="outline" size="sm" className="mt-3" onClick={add} icon={<Plus className="size-3.5" />}>
          {addLabel}
        </Button>
      )}
    </fieldset>
  );
}

function spanClass(span: number): string {
  // Literal class names so Tailwind picks them up.
  const map: Record<number, string> = { 3: "sm:col-span-3", 4: "sm:col-span-4", 6: "sm:col-span-6", 8: "sm:col-span-8", 12: "sm:col-span-12" };
  return map[span] ?? "sm:col-span-12";
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-fg-2 transition-colors disabled:opacity-30",
        danger ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-white hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
