import "server-only";

export interface ServerEnv {
  sessionSecret: string;
  demoAdminEmail: string;
  demoAdminPassword: string;
  emailProvider: "console" | "resend";
  resendApiKey: string;
  emailFrom: string;
  adminNotificationEmail: string;
  bookingWebhookSecret: string;
  localDataFile: string;
  /** Chrome/Chromium/Edge binary used by the Instant Funnel Scan. Empty = auto-detect. */
  chromeExecutablePath: string;
  /** Free Instant Funnel Scans per visitor per 24h before the upgrade prompt. */
  freeScansPerDay: number;
}

const DEV_SESSION_SECRET = "dev-only-insecure-session-secret-change-me-please";

export function serverEnv(): ServerEnv {
  const sessionSecret = process.env.SESSION_SECRET || "";
  if (!sessionSecret && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    // Fail loudly rather than silently signing sessions with a known key.
    console.error("[config] SESSION_SECRET is not set. Admin sessions are using an insecure development key.");
  }

  return {
    sessionSecret: sessionSecret || DEV_SESSION_SECRET,
    demoAdminEmail: process.env.DEMO_ADMIN_EMAIL || "admin@vibegen.studio",
    demoAdminPassword: process.env.DEMO_ADMIN_PASSWORD || "vibegen-demo-2026",
    emailProvider: process.env.EMAIL_PROVIDER === "resend" ? "resend" : "console",
    resendApiKey: process.env.RESEND_API_KEY || "",
    emailFrom: process.env.EMAIL_FROM || "VibeGen <hello@vibegen.studio>",
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "",
    bookingWebhookSecret: process.env.BOOKING_WEBHOOK_SECRET || "",
    localDataFile: process.env.LOCAL_DATA_FILE || "vibegen-db.json",
    chromeExecutablePath: process.env.CHROME_EXECUTABLE_PATH || "",
    freeScansPerDay: Math.max(1, Number(process.env.FREE_SCANS_PER_DAY) || 3),
  };
}
