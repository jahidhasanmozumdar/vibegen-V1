import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const control =
  "block w-full rounded-[12px] border border-[#d9dbe1] bg-white px-3.5 text-[15px] text-fg placeholder:text-fg-3 transition-[border-color,box-shadow] duration-150 hover:border-[#c3c6ce] focus:border-brand focus:shadow-[0_0_0_4px_rgb(10_108_255/0.14)] focus:outline-none focus-visible:outline-none disabled:bg-soft disabled:text-fg-3 aria-invalid:border-[#d92d20] aria-invalid:bg-[#fffafa] aria-invalid:focus:shadow-[0_0_0_4px_rgb(217_45_32/0.14)]";

export function Label({ className, required, children, ...props }: ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label className={cn("mb-1.5 block text-[14px] font-medium text-fg", className)} {...props}>
      {children}
      {required ? (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      ) : (
        <span className="ml-1.5 text-xs font-normal text-fg-3">Optional</span>
      )}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({ className, options, placeholder, ...props }: ComponentProps<"select"> & { options: readonly SelectOption[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select className={cn(control, "h-12 appearance-none pr-9", className)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Checkbox({ className, label, description, ...props }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label className={cn("group relative flex cursor-pointer items-start gap-3", className)}>
      <span className="relative mt-0.5 flex shrink-0">
        <input
          type="checkbox"
          className="peer size-[18px] shrink-0 cursor-pointer appearance-none rounded-[5px] border border-[#c3c6ce] bg-white transition-colors checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand aria-invalid:border-[#d92d20]"
          {...props}
        />
        <svg className="pointer-events-none absolute top-[3px] left-[3px] size-3 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="m2.5 6.2 2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[14px] leading-snug text-fg-2">
        {label}
        {description && <span className="mt-0.5 block text-[13px] text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** Label + control + hint + error wiring, with accessible descriptions. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string[] | string;
  className?: string;
  children: ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      {hint && !message && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-fg-3">
          {hint}
        </p>
      )}
      {message && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-[13px] font-semibold text-danger" role="alert">
          <svg className="mt-0.5 size-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.8v3.6M8 10.9v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {message}
        </p>
      )}
    </div>
  );
}

/** aria props for a control rendered inside <Field>. */
export function fieldAria(id: string, error?: string[] | string, hint?: boolean) {
  const hasError = Array.isArray(error) ? error.length > 0 : Boolean(error);
  return {
    id,
    "aria-invalid": hasError || undefined,
    "aria-describedby": hasError ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}
