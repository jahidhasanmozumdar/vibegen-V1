import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Table primitives. On small screens wrap with <ResponsiveTable> and supply
 * a mobile card list so users never have to zoom out.
 */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="relative overflow-x-auto">
      <table className={cn("w-full border-separate border-spacing-0 text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("sticky top-0 z-[1] bg-white [&_th]:border-b [&_th]:border-hair", className)} {...props} />;
}

const thCls = "px-4 py-3 text-[12.5px] font-medium whitespace-nowrap text-fg-3 first:pl-5 last:pr-5";

export function TH({ className, ...props }: ComponentProps<"th">) {
  return <th scope="col" className={cn(thCls, className)} {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-[#fafaf9] [&:not(:last-child)>td]:border-b [&>td]:border-hair", className)} {...props} />;
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle text-[13.5px] text-fg-2 first:pl-5 last:pr-5", className)} {...props} />;
}

/** Column header that toggles sort via URL params (works without JS). */
export function SortableTH({
  label,
  column,
  currentSort,
  currentDir,
  href,
  className,
}: {
  label: string;
  column: string;
  currentSort?: string;
  currentDir?: "asc" | "desc";
  href: (column: string, dir: "asc" | "desc") => string;
  className?: string;
}) {
  const active = currentSort === column;
  const nextDir = active && currentDir === "desc" ? "asc" : "desc";
  const Icon = !active ? ArrowUpDown : currentDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (currentDir === "asc" ? "ascending" : "descending") : "none"} className={cn(thCls, className)}>
      <Link href={href(column, nextDir)} className={cn("-mx-1.5 inline-flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 transition-colors hover:bg-soft hover:text-fg", active && "text-fg")} scroll={false}>
        {label}
        <Icon className={cn("size-3", active ? "text-fg" : "text-fg-3/70")} strokeWidth={2} aria-hidden="true" />
      </Link>
    </th>
  );
}

export function ResponsiveTable({ table, cards }: { table: ReactNode; cards: ReactNode }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[16px] border border-hair bg-white md:block">{table}</div>
      <ul className="space-y-3 md:hidden">{cards}</ul>
    </>
  );
}
