"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button, type ButtonVariant } from "./button";

/**
 * Accessible modal built on the native <dialog> element: focus trapping,
 * Escape to close and inert background come from the browser.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-[18px] border border-hair bg-white p-0 text-fg shadow-[0_32px_64px_-24px_rgb(10_13_20/0.35)] backdrop:bg-[rgb(10_13_20/0.32)] open:animate-fade",
        { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size],
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
        <div>
          <h2 id={titleId} className="text-[17px] leading-tight font-semibold tracking-[-0.02em]">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">
              {description}
            </p>
          )}
        </div>
        <button type="button" onClick={onClose} className="-m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-soft hover:text-fg" aria-label="Close">
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      {children && <div className="max-h-[70vh] overflow-y-auto px-6 py-3">{children}</div>}
      {footer && <div className="flex flex-wrap justify-end gap-2.5 rounded-b-[17px] px-6 pt-3 pb-5">{footer}</div>}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  pending,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  confirmVariant?: ButtonVariant;
  pending?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
