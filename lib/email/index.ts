import "server-only";

import { publicEnv } from "@/lib/config/env";
import { serverEnv } from "@/lib/config/server-env";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface EmailResult {
  delivered: boolean;
  provider: string;
}

interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<EmailResult>;
}

/** Development provider: records that an email would have been sent without sending it. */
const consoleProvider: EmailProvider = {
  name: "console",
  async send(message) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:console] to=${message.to} subject="${message.subject}"`);
    }
    return { delivered: false, provider: "console" };
  },
};

/** Resend over plain fetch; no SDK dependency needed. */
function resendProvider(apiKey: string, from: string): EmailProvider {
  return {
    name: "resend",
    async send(message) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
          reply_to: message.replyTo,
        }),
      });
      if (!res.ok) {
        console.error("[email:resend] send failed", res.status);
        return { delivered: false, provider: "resend" };
      }
      return { delivered: true, provider: "resend" };
    },
  };
}

function provider(): EmailProvider {
  const env = serverEnv();
  // Demo mode never sends real email.
  if (publicEnv.demoMode) return consoleProvider;
  if (env.emailProvider === "resend" && env.resendApiKey) return resendProvider(env.resendApiKey, env.emailFrom);
  return consoleProvider;
}

/** Fire-and-forget safe: never throws, so an email outage can't break a form submission. */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  try {
    return await provider().send(message);
  } catch (error) {
    console.error("[email] unexpected failure", error instanceof Error ? error.message : error);
    return { delivered: false, provider: "error" };
  }
}

export function adminRecipient(): string | null {
  return serverEnv().adminNotificationEmail || null;
}
