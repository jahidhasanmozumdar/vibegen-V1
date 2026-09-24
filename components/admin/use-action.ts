"use client";

import { startTransition, useEffect, useRef, useTransition, type FormEvent } from "react";

import { useToast } from "@/components/ui/toast";
import type { ActionState } from "@/lib/data/types";

/**
 * Run a server action from a button (not a form) inside a transition,
 * then toast the result. `pending` disables the trigger meanwhile.
 */
export function useActionRunner() {
  const { toast } = useToast();
  const [pending, startActionTransition] = useTransition();

  /** `optimistic` runs inside the same transition, so useOptimistic values hold until the action settles. */
  function run<T>(action: () => Promise<ActionState<T>>, onSuccess?: (state: ActionState<T>) => void, optimistic?: () => void) {
    startActionTransition(async () => {
      optimistic?.();
      try {
        const result = await action();
        if (result.status === "success") {
          toast(result.message ?? "Saved.");
          onSuccess?.(result);
        } else {
          toast(result.message ?? "Something went wrong. Try again.", "error");
        }
      } catch {
        toast("Something went wrong. Try again.", "error");
      }
    });
  }

  return { pending, run };
}

/**
 * onSubmit handler for `useActionState` forms that keeps the typed values when
 * validation fails (React resets `<form action>` forms after every submit).
 */
export function submitKeepingValues(dispatch: (formData: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  };
}

/** Toast once per new state returned by a `useActionState` form. */
export function useActionStateToast<T>(state: ActionState<T>, onSuccess?: (state: ActionState<T>) => void, options: { errorToast?: boolean } = {}) {
  const { toast } = useToast();
  const seen = useRef(state);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });
  useEffect(() => {
    if (seen.current === state) return;
    seen.current = state;
    if (state.status === "success") {
      toast(state.message ?? "Saved.");
      onSuccessRef.current?.(state);
    } else if (state.status === "error" && options.errorToast !== false && !state.fieldErrors) {
      toast(state.message ?? "Something went wrong. Try again.", "error");
    }
  }, [state, toast, options.errorToast]);
}
