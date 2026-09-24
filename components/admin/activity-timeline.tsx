import {
  ArrowRightLeft,
  CalendarCheck,
  ClipboardList,
  FileSignature,
  Inbox,
  PencilLine,
  RefreshCw,
  Send,
  StickyNote,
  Tags,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { activityTypeLabels } from "@/lib/data/labels";
import type { ActivityType, LeadActivity } from "@/lib/data/types";
import { formatDateTime, formatRelative } from "@/lib/utils/format";

const icons: Record<ActivityType, LucideIcon> = {
  submitted: Send,
  status_changed: ArrowRightLeft,
  note_added: StickyNote,
  audit_requested: ClipboardList,
  call_booked: CalendarCheck,
  proposal_sent: FileSignature,
  assigned: UserPlus,
  tags_updated: Tags,
  message_received: Inbox,
  converted: RefreshCw,
  updated: PencilLine,
};

/** Soft icon chip per activity type (decorative — the description and sr-only label carry meaning). */
const dotTones: Record<ActivityType, string> = {
  submitted: "bg-brand-soft text-brand",
  converted: "bg-brand-soft text-brand",
  audit_requested: "bg-[#f1ebff] text-[#7a3eff]",
  proposal_sent: "bg-[#f1ebff] text-[#7a3eff]",
  call_booked: "bg-[#e7f7ee] text-[#0f7a3d]",
  message_received: "bg-[#fff4e0] text-[#b54708]",
  status_changed: "bg-[#fff4e0] text-[#b54708]",
  note_added: "bg-[#f1f2f4] text-fg-2",
  assigned: "bg-[#f1f2f4] text-fg-2",
  tags_updated: "bg-[#f1f2f4] text-fg-2",
  updated: "bg-[#f1f2f4] text-fg-2",
};

/** Vertical activity timeline, newest first. */
export function ActivityTimeline({ activities }: { activities: LeadActivity[] }) {
  if (activities.length === 0) return <p className="text-[13px] text-fg-2">Nothing here yet.</p>;
  return (
    <ol className="relative">
      {activities.map((a, i) => {
        const Icon = icons[a.type] ?? PencilLine;
        const last = i === activities.length - 1;
        return (
          <li key={a.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className="absolute top-8 bottom-1 left-[13.5px] w-px bg-hair" aria-hidden="true" />}
            <span className={`relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${dotTones[a.type] ?? "bg-[#f1f2f4] text-fg-2"}`}>
              <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13.5px] font-medium text-fg">
                <span className="sr-only">{activityTypeLabels[a.type]}: </span>
                {a.description}
              </p>
              <p className="mt-0.5 text-[12px] text-fg-3">
                {a.actor_name ?? "System"} ·{" "}
                <time dateTime={a.created_at} title={formatDateTime(a.created_at)}>
                  {formatRelative(a.created_at)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
