"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/data/types";
import { RATE_LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { getRequestContext } from "@/lib/security/request";
import { checkSpam } from "@/lib/security/spam";
import { buildAttribution } from "@/lib/services/attribution";
import { DuplicateSubmissionError, submitBookingRequest, submitContactMessage, submitGrowthAudit } from "@/lib/services/submissions";
import {
  bookingRequestSchema,
  contactSchema,
  fieldErrors,
  formDataToObject,
  growthAuditSchema,
  parseAttributionField,
} from "@/lib/validation/schemas";

const GENERIC_ERROR = "Something went wrong on our side. Please try again in a moment.";
const RATE_LIMITED = "You've sent a few requests in a short time. Please wait a few minutes and try again.";
const INVALID = "A few details need another look. Check the highlighted fields.";

/** Shared guardrails for every public form. Returns an error state or request metadata. */
async function guard(formData: FormData, formKey: string) {
  const ctx = await getRequestContext();

  const spam = checkSpam(formData);
  if (spam.spam) {
    // Pretend success-shaped failure without revealing the heuristic.
    return { error: { status: "error", message: "Please wait a moment and submit again." } satisfies ActionState };
  }

  const limit = rateLimit(`${formKey}:${ctx.ip}`, RATE_LIMITS.form);
  if (!limit.ok) return { error: { status: "error", message: RATE_LIMITED } satisfies ActionState };

  const meta = buildAttribution(parseAttributionField(formData.get("attribution")), { device: ctx.device, country: ctx.country });
  return { meta };
}

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

export async function submitGrowthAuditAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guarded = await guard(formData, "audit");
  if ("error" in guarded) return guarded.error as ActionState;

  const parsed = growthAuditSchema.safeParse(formDataToObject(formData, ["services"]));
  if (!parsed.success) return { status: "error", message: INVALID, fieldErrors: fieldErrors(parsed.error) };

  let auditId: string;
  try {
    ({ auditId } = await submitGrowthAudit(parsed.data, guarded.meta));
  } catch (error) {
    if (error instanceof DuplicateSubmissionError) {
      return { status: "error", message: "We've already received this request — no need to send it twice. We'll be in touch shortly." };
    }
    console.error("[forms] growth audit failed", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  revalidateAdmin();
  redirect(`/free-growth-audit/thank-you?ref=${encodeURIComponent(auditId.slice(0, 8))}`);
}

export async function submitContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guarded = await guard(formData, "contact");
  if ("error" in guarded) return guarded.error as ActionState;

  const parsed = contactSchema.safeParse(formDataToObject(formData, ["services"]));
  if (!parsed.success) return { status: "error", message: INVALID, fieldErrors: fieldErrors(parsed.error) };

  try {
    await submitContactMessage(parsed.data, guarded.meta);
  } catch (error) {
    if (error instanceof DuplicateSubmissionError) {
      return { status: "success", message: "We've already got your message — we'll reply within one business day." };
    }
    console.error("[forms] contact failed", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  revalidateAdmin();
  return { status: "success", message: "Thanks — your message is with us. We reply within one business day." };
}

export async function submitBookingRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guarded = await guard(formData, "booking");
  if ("error" in guarded) return guarded.error as ActionState;

  const parsed = bookingRequestSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { status: "error", message: INVALID, fieldErrors: fieldErrors(parsed.error) };

  try {
    await submitBookingRequest(parsed.data, guarded.meta);
  } catch (error) {
    if (error instanceof DuplicateSubmissionError) {
      return { status: "success", message: "We've already got your request — we'll email you to confirm a time." };
    }
    console.error("[forms] booking request failed", error instanceof Error ? error.message : error);
    return { status: "error", message: GENERIC_ERROR };
  }

  revalidateAdmin();
  return { status: "success", message: "Request received. We'll email you within one business day to confirm a time that works." };
}
