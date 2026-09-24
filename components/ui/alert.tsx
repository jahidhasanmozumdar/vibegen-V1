import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type AlertTone = "info" | "success" | "warning" | "danger";

const tones: Record<AlertTone, { box: string; icon: ReactNode }> = {
  info: { box: "border-[#d6e6ff] bg-brand-soft [&>span:first-child]:text-brand", icon: <Info className="size-4" strokeWidth={2} /> },
  success: { box: "border-[#c9ecd8] bg-[#e7f7ee] [&>span:first-child]:text-[#0f7a3d]", icon: <CheckCircle2 className="size-4" strokeWidth={2} /> },
  warning: { box: "border-[#fbe2b8] bg-[#fff4e0] [&>span:first-child]:text-[#b54708]", icon: <AlertTriangle className="size-4" strokeWidth={2} /> },
  danger: { box: "border-[#f8cdc8] bg-[#fdecea] [&>span:first-child]:text-[#b42318]", icon: <XCircle className="size-4" strokeWidth={2} /> },
};

export function Alert({ tone = "info", title, children, className, action }: { tone?: AlertTone; title?: ReactNode; children?: ReactNode; className?: string; action?: ReactNode }) {
  const t = tones[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-[12px] border px-4 py-3 text-[13.5px] text-fg", t.box, className)}>
      <span className="mt-0.5 shrink-0">{t.icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn("text-fg-2", title && "mt-0.5")}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
