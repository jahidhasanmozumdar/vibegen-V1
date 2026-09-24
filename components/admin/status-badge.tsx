import { Badge, type BadgeTone } from "@/components/ui/badge";
import {
  auditStatusLabels,
  blogStatusLabels,
  bookingStatusLabels,
  findingStatusLabels,
  leadStatusLabels,
  messageStatusLabels,
  priorityLabels,
  publishStatusLabels,
} from "@/lib/data/labels";
import type { AuditStatus, BlogStatus, BookingStatus, FindingStatus, LeadStatus, MessageStatus, Priority, PublishStatus } from "@/lib/data/types";

/** Every status renders as text + tone, so meaning never depends on colour alone. */
const leadTones: Record<LeadStatus, BadgeTone> = {
  new: "accent",
  contacted: "cyan",
  qualified: "violet",
  proposal: "warning",
  won: "success",
  lost: "danger",
  archived: "neutral",
};

const auditTones: Record<AuditStatus, BadgeTone> = {
  new: "accent",
  reviewing: "cyan",
  in_progress: "violet",
  ready: "warning",
  sent: "success",
  completed: "success",
  archived: "neutral",
};

const bookingTones: Record<BookingStatus, BadgeTone> = {
  scheduled: "accent",
  completed: "success",
  cancelled: "neutral",
  no_show: "danger",
  follow_up: "warning",
};

const messageTones: Record<MessageStatus, BadgeTone> = { unread: "accent", read: "neutral", archived: "neutral" };
const priorityTones: Record<Priority, BadgeTone> = { high: "danger", medium: "warning", low: "neutral" };
const findingTones: Record<FindingStatus, BadgeTone> = { open: "accent", in_progress: "violet", resolved: "success", wont_fix: "neutral" };
const publishTones: Record<PublishStatus | BlogStatus, BadgeTone> = { draft: "neutral", published: "success", scheduled: "cyan" };

type StatusProps =
  | { kind: "lead"; value: LeadStatus }
  | { kind: "audit"; value: AuditStatus }
  | { kind: "booking"; value: BookingStatus }
  | { kind: "message"; value: MessageStatus }
  | { kind: "priority"; value: Priority }
  | { kind: "finding"; value: FindingStatus }
  | { kind: "publish"; value: PublishStatus | BlogStatus };

export function StatusBadge(props: StatusProps) {
  switch (props.kind) {
    case "lead":
      return <Badge tone={leadTones[props.value]} dot>{leadStatusLabels[props.value]}</Badge>;
    case "audit":
      return <Badge tone={auditTones[props.value]} dot>{auditStatusLabels[props.value]}</Badge>;
    case "booking":
      return <Badge tone={bookingTones[props.value]} dot>{bookingStatusLabels[props.value]}</Badge>;
    case "message":
      return <Badge tone={messageTones[props.value]} dot>{messageStatusLabels[props.value]}</Badge>;
    case "priority":
      return <Badge tone={priorityTones[props.value]}>{priorityLabels[props.value]} priority</Badge>;
    case "finding":
      return <Badge tone={findingTones[props.value]} dot>{findingStatusLabels[props.value]}</Badge>;
    case "publish":
      return (
        <Badge tone={publishTones[props.value]} dot>
          {props.value === "scheduled" ? blogStatusLabels.scheduled : publishStatusLabels[props.value as PublishStatus]}
        </Badge>
      );
  }
}
