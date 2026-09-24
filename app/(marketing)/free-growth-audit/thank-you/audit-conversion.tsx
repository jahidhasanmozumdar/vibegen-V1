"use client";

import { useEffect } from "react";

import { track } from "@/lib/tracking/events";

/** Fires growth_audit_submit once per reference, so a refresh doesn't count twice. */
export function AuditConversion({ reference }: { reference: string | null }) {
  useEffect(() => {
    const key = `vg_audit_tracked:${reference ?? "none"}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: still fire once for this mount.
    }
    track("growth_audit_submit", { form: "growth_audit", ...(reference ? { reference } : {}) });
  }, [reference]);

  return null;
}
