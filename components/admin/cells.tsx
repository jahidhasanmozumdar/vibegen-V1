import { serviceLabels } from "@/lib/data/labels";
import type { ServiceSlug } from "@/lib/data/types";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { formatDate, formatRelative, hostname, initials } from "@/lib/utils/format";

/** Soft tints for initials avatars, picked deterministically from the name (deep same-hue text, AA). */
const avatarTints = ["bg-brand-soft text-brand", "bg-[#f1ebff] text-[#5b21d6]", "bg-[#e7f7ee] text-[#0f7a3d]", "bg-[#fff4e0] text-[#b54708]", "bg-[#f1f2f4] text-fg-2"];

function tintFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return avatarTints[h % avatarTints.length];
}

/** Initials avatar (decorative — the name is always printed next to it). */
export function Avatar({ name, size = "sm", ring, className }: { name: string; size?: "xs" | "sm" | "md" | "lg"; ring?: boolean; className?: string }) {
  const dims = { xs: "size-6 text-[9.5px]", sm: "size-8 text-[11px]", md: "size-10 text-[13px]", lg: "size-14 text-[18px]" }[size];
  const inner = (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[-0.01em]", dims, tintFor(name), ring && "ring-2 ring-white", className)} aria-hidden="true">
      {initials(name) || "?"}
    </span>
  );
  return inner;
}

/** Name cell with an initials avatar and optional trailing content (e.g. a Demo mark). */
export function PersonCell({ name, sub, children }: { name: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={name} />
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-medium text-fg">
          <span className="truncate">{name}</span>
          {children}
        </span>
        {sub && <span className="block truncate text-[12px] font-normal text-fg-2">{sub}</span>}
      </span>
    </span>
  );
}

/** "Meta Ads +2" with the full list in a title/sr-only text. */
export function ServiceSummary({ services }: { services: ServiceSlug[] }) {
  if (services.length === 0) return <span className="text-fg-3">—</span>;
  const all = services.map((s) => serviceLabels[s]).join(", ");
  return (
    <span title={all} className="whitespace-nowrap">
      {serviceLabels[services[0]]}
      {services.length > 1 && (
        <>
          <span className="ml-1 text-fg-2" aria-hidden="true">
            +{services.length - 1}
          </span>
          <span className="sr-only">, {all}</span>
        </>
      )}
    </span>
  );
}

export function DemoMark({ show }: { show: boolean }) {
  return show ? (
    <span className="inline-flex h-[18px] shrink-0 items-center rounded-full bg-[#fff4e0] px-1.5 text-[10.5px] font-medium text-[#8a5a00]">
      Demo<span className="sr-only"> data</span>
    </span>
  ) : null;
}

export function DateCell({ iso }: { iso: string | null }) {
  return (
    <time dateTime={iso ?? undefined} title={iso ? new Date(iso).toLocaleString("en-US") : undefined} className="tabular whitespace-nowrap">
      {formatDate(iso)}
    </time>
  );
}

export function RelativeTime({ iso }: { iso: string | null }) {
  return (
    <time dateTime={iso ?? undefined} title={formatDate(iso)} className="whitespace-nowrap">
      {formatRelative(iso)}
    </time>
  );
}

export function WebsiteLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-fg-3">—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="whitespace-nowrap text-fg-2 underline decoration-[#d9dbe1] underline-offset-[3px] transition-colors hover:text-brand hover:decoration-brand">
      {hostname(url)}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
