import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";

import { DemoMark, RelativeTime } from "@/components/admin/cells";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/admin/page-header";
import { StatusTabs } from "@/components/admin/status-tabs";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { serviceLabels } from "@/lib/data/labels";
import { hasActiveMessageFilters, listMessages, parseMessageFilters } from "@/lib/services/admin/messages";
import { buildHref, flatParams } from "@/lib/services/admin/query";
import { cn } from "@/lib/utils/cn";
import { truncate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Contact Messages" };

export default async function MessagesPage(props: PageProps<"/admin/messages">) {
  await requireUser();
  const sp = await props.searchParams;
  const filters = parseMessageFilters(sp);
  const values = flatParams(sp);
  const result = await listMessages(filters);
  const pageHref = (page: number) => buildHref("/admin/messages", { ...values, page });

  return (
    <div>
      <PageHeader title="Contact Messages" description="Messages from the contact form. Convert the good ones into leads." demo={publicEnv.demoMode} />

      <StatusTabs
        basePath="/admin/messages"
        values={values}
        label="Filter messages"
        tabs={[
          { value: undefined, label: "Inbox", count: result.counts.inbox },
          { value: "unread", label: "Unread", count: result.counts.unread },
          { value: "read", label: "Read", count: result.counts.read },
          { value: "archived", label: "Archived", count: result.counts.archived },
        ]}
      />

      <ListToolbar
        values={values}
        searchLabel="Search messages"
        searchPlaceholder="Search name, email, company, message…"
        filters={[{ name: "demo", label: "Data type", allLabel: "Real + demo", options: [{ value: "real", label: "Real only" }, { value: "demo", label: "Demo only" }] }]}
      />

      {result.total === 0 ? (
        hasActiveMessageFilters(filters) ? (
          <EmptyState
            icon={<Inbox className="size-5" strokeWidth={1.75} />}
            title="No messages match these filters"
            description="Try a different search or view."
            action={
              <ButtonLink href="/admin/messages" variant="outline" size="sm">
                Clear filters
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState icon={<Inbox className="size-5" strokeWidth={1.75} />} title="No messages yet." description="Messages sent through the contact form show up here." />
        )
      ) : (
        <>
          <ul className="divide-y divide-hair overflow-hidden rounded-[16px] border border-hair bg-white">
            {result.rows.map((m) => {
              const unread = m.status === "unread";
              return (
                <li key={m.id}>
                  <Link href={`/admin/messages/${m.id}`} className={cn("flex gap-3 px-4 py-3.5 transition-colors hover:bg-[#fafaf9] sm:px-5", unread && "bg-brand-soft/50")}>
                    <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-[3px] border", unread ? "border-hair bg-[#0a6cff]" : "border-hair bg-transparent")} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={cn("text-[14px]", unread ? "font-semibold text-fg" : "font-medium text-fg-2")}>{m.name}</span>
                        {unread && <span className="sr-only">Unread</span>}
                        {m.company && <span className="text-[13px] text-fg-2">· {m.company}</span>}
                        <DemoMark show={m.is_demo} />
                        {m.lead_id && <span className="rounded-[5px] border border-hair bg-soft px-1.5 text-[11px] font-medium text-fg-2">Linked to lead</span>}
                        {m.status === "archived" && <span className="rounded-[5px] border border-hair bg-soft px-1.5 text-[11px] font-medium text-fg-2">Archived</span>}
                      </span>
                      <span className={cn("mt-0.5 block text-[13px] leading-relaxed", unread ? "text-fg" : "text-fg-2")}>{truncate(m.message, 180)}</span>
                      {m.services.length > 0 && <span className="mt-1 block text-[12px] text-fg-2">Interested in {m.services.map((s) => serviceLabels[s]).join(", ")}</span>}
                    </span>
                    <span className="shrink-0 text-[12px] text-fg-2">
                      <RelativeTime iso={m.created_at} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Pagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} href={pageHref} />
        </>
      )}
    </div>
  );
}
