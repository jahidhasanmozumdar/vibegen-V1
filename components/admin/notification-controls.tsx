"use client";

import { CheckCheck } from "lucide-react";

import { useActionRunner } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import { markAllNotificationsAction, markNotificationAction } from "@/lib/actions/admin/notifications";

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const { pending, run } = useActionRunner();
  return (
    <Button size="sm" variant="outline" disabled={disabled} loading={pending} icon={<CheckCheck className="size-4" aria-hidden="true" />} onClick={() => run(() => markAllNotificationsAction())}>
      Mark all as read
    </Button>
  );
}

export function ToggleReadButton({ id, read, title }: { id: string; read: boolean; title: string }) {
  const { pending, run } = useActionRunner();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(() => markNotificationAction(id, !read))}
      className="rounded-[7px] border border-transparent px-2 py-1 text-[12.5px] font-semibold whitespace-nowrap text-fg hover:border-[#c3c6ce] hover:bg-white disabled:opacity-50"
    >
      {read ? "Mark unread" : "Mark read"}
      <span className="sr-only">: {title}</span>
    </button>
  );
}
