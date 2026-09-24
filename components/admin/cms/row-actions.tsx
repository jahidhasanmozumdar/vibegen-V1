"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dropdown, type DropdownItem } from "@/components/ui/dropdown";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { ActionState } from "@/lib/data/types";

type Run = () => Promise<ActionState<{ id: string }>>;

function useRunner() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const run = (fn: Run, after?: () => void) =>
    start(async () => {
      const result = await fn();
      if (result.status === "success") {
        toast(result.message ?? "Done.");
        if (after) after();
        else router.refresh();
      } else {
        toast(result.message ?? "Something went wrong. Try again.", "error");
      }
    });
  return { pending, run };
}

/** "…" menu on list rows: edit, view live, publish/unpublish, delete (confirmed). */
export function CmsRowActions({
  label,
  editHref,
  viewHref,
  toggle,
  onDelete,
  deleteDescription,
}: {
  label: string;
  editHref: string;
  viewHref?: string | null;
  toggle?: { active: boolean; activateLabel: string; deactivateLabel: string; run: Run };
  onDelete?: Run;
  deleteDescription?: string;
}) {
  const router = useRouter();
  const { pending, run } = useRunner();
  const [confirming, setConfirming] = useState(false);

  const items: DropdownItem[] = [{ label: "Edit", icon: <Pencil className="size-4 text-fg-2" />, onSelect: () => router.push(editHref) }];
  if (viewHref) items.push({ label: "View live page", icon: <ExternalLink className="size-4 text-fg-2" />, onSelect: () => window.open(viewHref, "_blank", "noopener") });
  if (toggle) {
    items.push({
      label: toggle.active ? toggle.deactivateLabel : toggle.activateLabel,
      icon: toggle.active ? <EyeOff className="size-4 text-fg-2" /> : <Eye className="size-4 text-fg-2" />,
      onSelect: () => run(toggle.run),
      disabled: pending,
    });
  }
  if (onDelete) items.push({ label: "Delete", icon: <Trash2 className="size-4" />, danger: true, onSelect: () => setConfirming(true), disabled: pending });

  return (
    <>
      <Dropdown
        label={`Actions for ${label}`}
        trigger={
          <span className="inline-flex size-8 items-center justify-center rounded-md border border-transparent text-fg hover:border-[#c3c6ce] hover:bg-white">
            <MoreHorizontal className="size-4" />
          </span>
        }
        items={items}
      />
      {onDelete && (
        <ConfirmDialog
          open={confirming}
          onCancel={() => setConfirming(false)}
          onConfirm={() => run(onDelete, () => { setConfirming(false); router.refresh(); })}
          title={`Delete “${label}”?`}
          description={deleteDescription ?? "This permanently removes it from the site and the admin. This can't be undone."}
          confirmLabel="Delete"
          pending={pending}
        />
      )}
    </>
  );
}

/** Delete button for edit pages; returns to the list afterwards. */
export function DeleteButton({ label, onDelete, redirectTo, description }: { label: string; onDelete: Run; redirectTo: string; description?: string }) {
  const router = useRouter();
  const { pending, run } = useRunner();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-soft" icon={<Trash2 className="size-4" />} onClick={() => setOpen(true)}>
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          run(onDelete, () => {
            setOpen(false);
            router.push(redirectTo);
          })
        }
        title={`Delete “${label}”?`}
        description={description ?? "This permanently removes it from the site and the admin. This can't be undone."}
        confirmLabel="Delete"
        pending={pending}
      />
    </>
  );
}
