import type { ReactNode } from "react";
import { CheckCircle2, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

/** Server-rendered, read-only settings panels (status + explanations). */

export function StatusRow({ label, ok, okText = "Configured", offText = "Not configured", detail }: { label: ReactNode; ok: boolean; okText?: string; offText?: string; detail?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-hair py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{label}</p>
        {detail && <p className="mt-0.5 text-[13px] text-fg-2">{detail}</p>}
      </div>
      <Badge tone={ok ? "success" : "neutral"} className="self-start sm:self-auto">
        {ok ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <CircleDashed className="size-3.5" aria-hidden="true" />}
        {ok ? okText : offText}
      </Badge>
    </div>
  );
}

export function Panel({ title, description, children, className }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader title={title} description={description} />
      <CardBody className="py-2">{children}</CardBody>
    </Card>
  );
}

export function KeyValue({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="divide-y divide-hair">
      {items.map(([k, v], i) => (
        <div key={i} className="grid gap-1 py-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-4">
          <dt className="text-sm text-fg-2">{k}</dt>
          <dd className={cn("text-sm text-fg")}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
