import { siteConfig } from "@/lib/config/site";
import type { EmailMessage } from "./index";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f9fc;font-family:Inter,Arial,sans-serif;color:#1a1c1e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3e7ee;border-radius:10px">
<tr><td style="padding:28px 32px 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5a6470">${escapeHtml(siteConfig.name)}</td></tr>
<tr><td style="padding:0 32px 8px"><h1 style="font-size:20px;line-height:1.3;margin:0">${escapeHtml(title)}</h1></td></tr>
<tr><td style="padding:8px 32px 28px;font-size:15px;line-height:1.6">${bodyHtml}</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(fields: [string, string | null | undefined][]): { html: string; text: string } {
  const present = fields.filter(([, v]) => v);
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e3e7ee;margin-top:12px">${present
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 0;color:#5a6470;width:38%;vertical-align:top;border-bottom:1px solid #e3e7ee">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #e3e7ee">${escapeHtml(String(v))}</td></tr>`,
      )
      .join("")}</table>`,
    text: present.map(([k, v]) => `${k}: ${v}`).join("\n"),
  };
}

export function adminNotificationEmail(opts: {
  to: string;
  kind: "audit" | "contact" | "booking";
  name: string;
  email: string;
  fields: [string, string | null | undefined][];
  adminPath: string;
}): EmailMessage {
  const label = { audit: "growth audit request", contact: "contact message", booking: "strategy call request" }[opts.kind];
  const title = `New ${label} from ${opts.name}`;
  const table = rows([["Email", opts.email], ...opts.fields]);
  const url = `${siteConfig.url}${opts.adminPath}`;
  return {
    to: opts.to,
    replyTo: opts.email,
    subject: title,
    text: `${title}\n\n${table.text}\n\nOpen in admin: ${url}`,
    html: layout(
      title,
      `${table.html}<p style="margin-top:20px"><a href="${escapeHtml(url)}" style="background:#0a84ff;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Review in admin</a></p>`,
    ),
  };
}

export function leadConfirmationEmail(opts: { to: string; firstName: string; kind: "audit" | "contact" | "booking" }): EmailMessage {
  const copy = {
    audit: {
      subject: "We've got your growth audit request",
      body: "Thanks for requesting a growth audit. We'll review your website, tracking and (with access) your ad accounts, then come back to you within two business days with what we found and what we'd fix first.",
    },
    contact: {
      subject: "Thanks for getting in touch",
      body: "Thanks for your message. Someone from the team will reply within one business day.",
    },
    booking: {
      subject: "Your strategy call request",
      body: "Thanks for requesting a strategy call. We'll confirm a time by email within one business day.",
    },
  }[opts.kind];

  const text = `Hi ${opts.firstName},\n\n${copy.body}\n\nIf anything changes, just reply to this email.\n\n— ${siteConfig.name}`;
  return {
    to: opts.to,
    subject: copy.subject,
    text,
    html: layout(
      copy.subject,
      `<p>Hi ${escapeHtml(opts.firstName)},</p><p>${escapeHtml(copy.body)}</p><p>If anything changes, just reply to this email.</p><p style="color:#5a6470">— ${escapeHtml(siteConfig.name)}</p>`,
    ),
  };
}
