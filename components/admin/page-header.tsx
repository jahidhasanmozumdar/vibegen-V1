import type { ReactNode } from "react";

import { DemoBadge } from "@/components/ui/badge";

/** Title row at the top of every admin page. */
export function PageHeader({ title, description, actions, demo }: { title: string; description?: ReactNode; actions?: ReactNode; demo?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.03em] text-fg sm:text-[28px]">{title}</h1>
          {demo && <DemoBadge />}
        </div>
        {description && <p className="mt-1 text-[14px] text-fg-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
