import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** URL-driven pagination: `href(page)` builds the link, so it works without JS and is shareable. */
export function Pagination({ page, pageCount, total, pageSize, href }: { page: number; pageCount: number; total: number; pageSize: number; href: (page: number) => string }) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const linkCls = "inline-flex h-9 items-center gap-1 rounded-full bg-white px-3.5 text-[13px] font-medium text-fg shadow-[inset_0_0_0_1px_#dcdde2] transition-shadow hover:shadow-[inset_0_0_0_1px_#b9bcc4]";
  const disabledCls = "pointer-events-none opacity-45";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 py-3 text-[13px] text-fg-3">
      <p className="tabular">
        Showing <span className="font-medium text-fg">{from}</span>–<span className="font-medium text-fg">{to}</span> of{" "}
        <span className="font-medium text-fg">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link href={href(page - 1)} aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} className={cn(linkCls, page <= 1 && disabledCls)} scroll={false}>
          <ChevronLeft className="size-3.5" aria-hidden="true" /> Previous
        </Link>
        <span className="tabular px-1.5 text-[13px] text-fg-2">
          Page {page} of {pageCount}
        </span>
        <Link
          href={href(page + 1)}
          aria-disabled={page >= pageCount}
          tabIndex={page >= pageCount ? -1 : undefined}
          className={cn(linkCls, page >= pageCount && disabledCls)}
          scroll={false}
        >
          Next <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
