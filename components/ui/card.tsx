import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** "Premium Calm" panel: white, 1px hairline, 16px radius, no shadow. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-[16px] border border-hair bg-white", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-hair px-5 py-4 sm:px-6", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] leading-tight font-semibold tracking-[-0.015em] text-fg">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-fg-3">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}
