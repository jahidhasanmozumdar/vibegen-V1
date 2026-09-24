"use server";

import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/data/types";
import { cmsGet, cmsUpdate } from "@/lib/services/admin/cms";
import { benefitListSchema, faqListSchema, fieldErrors, formDataToObject, industrySchema, parseJsonField } from "@/lib/validation/schemas";
import { failure, idFrom, invalid, revalidateAll } from "./cms-shared";

type Result = ActionState<{ id: string }>;

/** Industries are edit-only: the slugs are fixed (INDUSTRY_SLUGS). */
export async function saveIndustryAction(_prev: Result, formData: FormData): Promise<Result> {
  await requireUser("content:write");
  const id = idFrom(formData);
  if (!id) return { status: "error", message: "Missing industry id." };

  const parsed = industrySchema.safeParse(formDataToObject(formData, ["services"]));
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { challenges_json, approach_json, faqs_json, ...input } = parsed.data;

  const challenges = parseJsonField(challenges_json, benefitListSchema, []);
  const approach = parseJsonField(approach_json, benefitListSchema, []);
  const faqs = parseJsonField(faqs_json, faqListSchema, []);
  const errors: Record<string, string[]> = {};
  if (!challenges.ok) errors.challenges_json = ["Some challenge rows are too long."];
  if (!approach.ok) errors.approach_json = ["Some approach rows are too long."];
  if (!faqs.ok) errors.faqs_json = ["Some FAQ rows are too long."];
  if (Object.keys(errors).length) return invalid(errors);

  try {
    const industry = await cmsGet("industries", id);
    if (!industry) return { status: "error", message: "That industry no longer exists." };
    await cmsUpdate("industries", id, {
      ...input,
      challenges: challenges.value.filter((b) => b.title.trim()),
      approach: approach.value.filter((b) => b.title.trim()),
      faqs: faqs.value.filter((f) => f.question.trim()),
    });
    revalidateAll(["/admin/industries", `/admin/industries/${id}`, "/industries", `/industries/${industry.slug}`, "/", "/sitemap.xml"]);
    return { status: "success", message: "Changes saved.", data: { id } };
  } catch (error) {
    return failure(error);
  }
}
