"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = Date.now() + Math.random();
      setItems((all) => [...all.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex animate-reveal items-start gap-3 rounded-[12px] border border-hair bg-white px-4 py-3 text-[13.5px] font-medium text-fg shadow-[0_20px_40px_-20px_rgb(10_13_20/0.3)]"
          >
            {t.tone === "error" ? (
              <XCircle className="mt-0.5 size-4 shrink-0 text-[#d92d20]" strokeWidth={2} />
            ) : (
              <CheckCircle2 className={cn("mt-0.5 size-4 shrink-0", t.tone === "success" ? "text-[#12a150]" : "text-brand")} strokeWidth={2} />
            )}
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} className="-m-1 rounded-full p-1 text-fg-3 hover:bg-soft hover:text-fg" aria-label="Dismiss">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}
