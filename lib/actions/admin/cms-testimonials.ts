"use server";

import { requireUser } from "@/lib/auth/session";
import type { ActionState, PublishStatus } from "@/lib/data/types";
import { cmsCreate, cmsDelete, cmsGet, cmsUpdate } from "@/lib/services/admin/cms";
import { fieldErrors, formDataToObject, testimonialSchema } from "@/lib/validation/schemas";
import { failure, idFrom, invalid, revalidateAll } from "./cms-shared";

type Result = ActionState<{ id: string }>;

// Testimonials appear on the homepage, service pages and case studies.
const PATHS = ["/admin/testimonials", "/", "/case-studies", "/services", "/about"];

export async function saveTestimonialAction(_prev: Result, formData: FormData): Promise<Result> {
  await requireUser("content:write");
  const id = idFrom(formData);
  const parsed = testimonialSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return invalid(fieldErrors(parsed.error));

  try {
    const previous = id ? await cmsGet("testimonials", id) : null;
    if (id && !previous) return { status: "error", message: "That testimonial no longer exists." };
    const saved = previous ? await cmsUpdate("testimonials", previous.id, parsed.data) : await cmsCreate("testimonials", parsed.data);
    revalidateAll([...PATHS, `/admin/testimonials/${saved.id}`]);
    return { status: "success", message: previous ? "Changes saved." : "Testimonial added.", data: { id: saved.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setTestimonialStatusAction(id: string, status: PublishStatus): Promise<Result> {
  await requireUser("content:write");
  try {
    await cmsUpdate("testimonials", id, { status });
    revalidateAll([...PATHS, `/admin/testimonials/${id}`]);
    return { status: "success", message: status === "published" ? "Testimonial published." : "Testimonial unpublished.", data: { id } };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteTestimonialAction(id: string): Promise<Result> {
  await requireUser("content:write");
  try {
    await cmsDelete("testimonials", id);
    revalidateAll([...PATHS, "/admin/case-studies"]);
    return { status: "success", message: "Testimonial deleted." };
  } catch (error) {
    return failure(error);
  }
}
