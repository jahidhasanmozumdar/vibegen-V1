"use server";

import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/data/types";
import { cmsGet, cmsUpdate } from "@/lib/services/admin/cms";
import { benefitListSchema, faqListSchema, fieldErrors, formDataToObject, parseJsonField, serviceSchema } from "@/lib/validation/schemas";
import { failure, idFrom, invalid, revalidateAll } from "./cms-shared";

type Result = ActionState<{ id: string }>;

/** Services are edit-only: the five slugs are fixed by the product (SERVICE_SLUGS). */
export async function saveServiceAction(_prev: Result, formData: FormData): Promise<Result> {
  await requireUser("content:write");
  const id = idFrom(formData);
  if (!id) return { status: "error", message: "Missing service id." };

  const parsed = serviceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { features_json, benefits_json, faqs_json, ...input } = parsed.data;

  const features = parseJsonField(features_json, benefitListSchema, []);
  const benefits = parseJsonField(benefits_json, benefitListSchema, []);
  const faqs = parseJsonField(faqs_json, faqListSchema, []);
  const errors: Record<string, string[]> = {};
  if (!features.ok) errors.features_json = ["Some feature rows are too long."];
  if (!benefits.ok) errors.benefits_json = ["Some benefit rows are too long."];
  if (!faqs.ok) errors.faqs_json = ["Some FAQ rows are too long."];
  if (Object.keys(errors).length) return invalid(errors);

  try {
    const service = await cmsGet("services", id);
    if (!service) return { status: "error", message: "That service no longer exists." };
    await cmsUpdate("services", id, {
      ...input,
      features: features.value.filter((b) => b.title.trim()),
      benefits: benefits.value.filter((b) => b.title.trim()),
      faqs: faqs.value.filter((f) => f.question.trim()),
    });
    revalidateAll(["/admin/services", `/admin/services/${id}`, "/services", `/services/${service.slug}`, "/", "/pricing", "/sitemap.xml"]);
    return { status: "success", message: "Changes saved.", data: { id } };
  } catch (error) {
    return failure(error);
  }
}
