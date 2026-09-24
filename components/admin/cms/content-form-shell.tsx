"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ActionState } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

export type SaveState = ActionState<{ id: string }>;

const DirtyContext = createContext<() => void>(() => {});

/** Lets custom widgets (repeatable rows, toggles) flag the form as changed. */
export function useMarkDirty(): () => void {
  return useContext(DirtyContext);
}

export interface PublishToggle {
  published: boolean;
  publishLabel?: string;
  unpublishLabel?: string;
  run: () => Promise<SaveState>;
}

/**
 * Form wrapper for every CMS editor: submits through a server action without
 * React's automatic form reset (so inputs survive validation errors), tracks
 * unsaved changes, warns before leaving, and shows a sticky save bar.
 */
export function ContentFormShell({
  action,
  state,
  pending,
  children,
  aside,
  backHref,
  isNew,
  editHref,
  submitLabel = "Save Changes",
  publish,
  extraActions,
}: {
  action: (formData: FormData) => void;
  state: SaveState;
  pending: boolean;
  children: ReactNode;
  aside?: ReactNode;
  backHref: string;
  isNew?: boolean;
  /** Where to go after creating a record, e.g. (id) => `/admin/blog/${id}`. */
  editHref?: (id: string) => string;
  submitLabel?: string;
  publish?: PublishToggle;
  extraActions?: ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const [, startTransition] = useTransition();
  const [toggling, startToggle] = useTransition();
  const [seenState, setSeenState] = useState(state);

  // Reset the dirty flag when a save succeeds (state-derived update during render).
  if (seenState !== state) {
    setSeenState(state);
    if (state.status === "success") setDirty(false);
  }

  const markDirty = useCallback(() => setDirty(true), []);

  const handled = useRef<SaveState>(state);
  useEffect(() => {
    // Only react once per new action result (callbacks from props may change identity).
    if (handled.current === state || state.status === "idle") return;
    handled.current = state;
    if (state.status === "success") {
      toast(state.message ?? "Saved.");
      if (isNew && editHref && state.data?.id) router.replace(editHref(state.data.id));
    } else if (state.message) {
      toast(state.message, "error");
    }
  }, [state, toast, isNew, editHref, router]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  function runToggle() {
    if (!publish) return;
    startToggle(async () => {
      const result = await publish.run();
      if (result.status === "success") {
        toast(result.message ?? "Updated.");
        router.refresh();
      } else {
        toast(result.message ?? "Something went wrong. Try again.", "error");
      }
    });
  }

  const errorCount = Object.values(state.fieldErrors ?? {}).filter((v) => v && v.length).length;

  return (
    <DirtyContext.Provider value={markDirty}>
      <form ref={formRef} onSubmit={onSubmit} onChange={markDirty} onInput={markDirty} noValidate className="pb-4">
        {state.status === "error" && state.message && (
          <Alert tone="danger" className="mb-5" title={state.message}>
            {errorCount > 0 ? `${errorCount} field${errorCount === 1 ? " needs" : "s need"} attention below.` : undefined}
          </Alert>
        )}
        <div className={cn("grid gap-6", aside && "lg:grid-cols-[minmax(0,1fr)_20rem]")}>
          <div className="min-w-0 space-y-6">{children}</div>
          {aside && <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">{aside}</aside>}
        </div>

        <div className="sticky bottom-3 z-20 mt-8 rounded-[16px] border border-hair bg-white/95 px-4 py-3 shadow-[0_16px_40px_-20px_rgb(10_13_20/0.3)] backdrop-blur-md sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-fg-2" aria-live="polite">
              <span className={cn("size-2 rounded-full", dirty ? "bg-[#f79009]" : "bg-[#12a150]")} aria-hidden="true" />
              {pending ? "Saving…" : dirty ? "Unsaved changes" : isNew ? "Not saved yet" : "All changes saved"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {extraActions}
              <Link href={backHref} className="inline-flex h-9 items-center rounded-full px-4 text-[13.5px] font-medium text-fg-2 transition-colors hover:bg-soft hover:text-fg focus-visible:outline-brand">
                Cancel
              </Link>
              {publish && !isNew && (
                <Button
                  variant="outline"
                  size="sm"
                  className=""
                  onClick={runToggle}
                  loading={toggling}
                  disabled={dirty || pending}
                  title={dirty ? "Save your changes first" : undefined}
                >
                  {publish.published ? (publish.unpublishLabel ?? "Unpublish") : (publish.publishLabel ?? "Publish")}
                </Button>
              )}
              <Button type="submit" size="sm" className="" loading={pending} loadingText="Saving…">
                {submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </DirtyContext.Provider>
  );
}

/**
 * Local state that follows its prop when the server sends a new value
 * (e.g. after Publish/Unpublish refreshes the page) without remounting.
 */
export function useSyncedState<T>(value: T) {
  const [state, setState] = useState(value);
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setState(value);
  }
  return [state, setState] as const;
}

/** Titled section card used inside editors. */
export function EditorSection({ title, description, children, className }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[16px] border border-hair bg-white", className)}>
      <header className="border-b border-hair px-5 py-3.5">
        <h2 className="text-[17px] leading-tight font-semibold tracking-[-0.025em]">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-fg-2">{description}</p>}
      </header>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </section>
  );
}
