import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";

import { DemoMark } from "@/components/admin/cells";
import { MarkAllReadButton, ToggleReadButton } from "@/components/admin/notification-controls";
import { PageHeader } from "@/components/admin/page-header";
import { StatusTabs } from "@/components/admin/status-tabs";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { notificationTypeLabels } from "@/lib/data/labels";
import { listNotifications } from "@/lib/services/admin/notifications";
import { buildHref, enumParam, flatParams, pageParam, paginate } from "@/lib/services/admin/query";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage(props: PageProps<"/admin/notifications">) {
  await requireUser();
  const sp = await props.searchParams;
  const values = flatParams(sp);
  const filter = enumParam(sp, "filter", ["unread"] as const);
  const all = await listNotifications();
  const unreadCount = all.filter((n) => !n.read_at).length;
  const rows = filter === "unread" ? all.filter((n) => !n.read_at) : all;
  const page = paginate(rows, pageParam(sp), 25);

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="New leads, audits, messages, bookings and status changes."
        demo={publicEnv.demoMode}
        actions={<MarkAllReadButton disabled={unreadCount === 0} />}
      />
      <StatusTabs
        basePath="/admin/notifications"
        values={values}
        param="filter"
        label="Filter notifications"
        tabs={[
          { value: undefined, label: "All", count: all.length },
          { value: "unread", label: "Unread", count: unreadCount },
        ]}
      />

      {page.total === 0 ? (
        <EmptyState
          icon={<Bell className="size-5" strokeWidth={1.75} />}
          title={filter === "unread" ? "You're all caught up." : "Nothing here yet."}
          description={filter === "unread" ? "No unread notifications." : "You'll be notified about new leads, audit requests, messages and bookings."}
        />
      ) : (
        <>
          <ul className="divide-y divide-hair overflow-hidden rounded-[16px] border border-hair bg-white">
            {page.rows.map((n) => {
              const unread = !n.read_at;
              return (
                <li key={n.id} className={cn("flex items-start gap-3 px-4 py-3 sm:px-5", unread && "bg-brand-soft/50")}>
                  <span className={cn("mt-2 size-2 shrink-0 rounded-full", unread ? "bg-accent" : "bg-transparent")} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      {n.link ? (
                        <Link href={n.link} className={cn("text-[14px] underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]", unread ? "font-semibold text-fg" : "font-medium text-fg-2")}>
                          {n.title}
                        </Link>
                      ) : (
                        <span className={cn("text-[14px]", unread ? "font-semibold text-fg" : "font-medium text-fg-2")}>{n.title}</span>
                      )}
                      {unread && <span className="sr-only">(unread)</span>}
                      <span className="rounded-[5px] border border-hair bg-soft px-1.5 text-[11px] font-medium text-fg-2">{notificationTypeLabels[n.type]}</span>
                      <DemoMark show={n.is_demo} />
                    </p>
                    <p className="mt-0.5 text-[13px] text-fg-2">{n.body}</p>
                    <p className="mt-0.5 text-[12px] text-fg-3">
                      <time dateTime={n.created_at} title={formatDateTime(n.created_at)}>
                        {formatRelative(n.created_at)}
                      </time>
                    </p>
                  </div>
                  <ToggleReadButton id={n.id} read={!unread} title={n.title} />
                </li>
              );
            })}
          </ul>
          <Pagination page={page.page} pageCount={page.pageCount} total={page.total} pageSize={page.pageSize} href={(p) => buildHref("/admin/notifications", { ...values, page: p })} />
        </>
      )}
    </div>
  );
}
