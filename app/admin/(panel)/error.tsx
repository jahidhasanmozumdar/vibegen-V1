"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function AdminPanelError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("[admin] page error", error.digest ?? error.message);
  }, [error]);

  return (
    <ErrorState
      className="mt-6"
      description="We couldn't load this page. It's usually temporary — try again, or head back to the overview."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => retry()}>Try again</Button>
          <ButtonLink href="/admin" variant="outline">
            Back to Overview
          </ButtonLink>
        </div>
      }
    />
  );
}
