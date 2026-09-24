import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4", className)} aria-hidden="true" />;
}

/** Table-shaped loading placeholder used by admin loading.tsx files. */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-hair bg-white" role="status" aria-label="Loading">
      <div className="flex gap-4 border-b border-hair px-5 py-3.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-hair px-5 py-4 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn("h-3.5 flex-1", c === 0 && "max-w-40")} />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center overflow-hidden rounded-[16px] border border-hair bg-white px-6 py-14 text-center", className)}>
      {icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-[12px] border border-hair bg-soft text-fg-2">
          {icon}
        </div>
      )}
      <p className="text-[16px] leading-tight font-semibold tracking-[-0.015em] text-fg">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[13.5px] text-fg-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong.",
  description = "We couldn't load this. It's usually temporary.",
  action,
  className,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center rounded-[16px] border border-hair bg-white px-6 py-12 text-center", className)}>
      <div className="mb-4 flex size-11 items-center justify-center rounded-[12px] bg-[#fdecea] text-[#b42318]">
        <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6v4.5M10 13.6v.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[16px] leading-tight font-semibold tracking-[-0.015em] text-fg">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[13.5px] text-fg-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
