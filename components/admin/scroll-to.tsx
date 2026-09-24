"use client";

import { useEffect } from "react";

/** Scroll a highlighted element (e.g. `?highlight=id`) into view once on mount. */
export function ScrollTo({ id }: { id: string }) {
  useEffect(() => {
    document.getElementById(id)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [id]);
  return null;
}
