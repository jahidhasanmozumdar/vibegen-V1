"use server";

import { requireUser } from "@/lib/auth/session";
import type { ActionState } from "@/lib/data/types";
import { assertUniqueSlug, cmsCreate, cmsDelete, cmsGet, cmsList, cmsUpdate } from "@/lib/services/admin/cms";
import { fieldErrors, formDataToObject, pricingPlanSchema } from "@/lib/validation/schemas";
import { failure, idFrom, invalid, revalidateAll } from "./cms-shared";

type Result = ActionState<{ id: string }>;

const PATHS = ["/admin/pricing", "/pricing", "/", "/services"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isSafeHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

export async function savePricingPlanAction(_prev: Result, formData: FormData): Promise<Result> {
  await requireUser("content:write");
  const id = idFrom(formData);
  const parsed = pricingPlanSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const input = parsed.data;
  if (!isSafeHref(input.cta_href)) return invalid({ cta_href: ["Use a site path like /free-growth-audit or a full https:// link."] });

  try {
    const previous = id ? await cmsGet("pricing_plans", id) : null;
    if (id && !previous) return { status: "error", message: "That plan no longer exists." };

    if (previous) {
      await cmsUpdate("pricing_plans", previous.id, input);
      revalidateAll([...PATHS, `/admin/pricing/${previous.id}`]);
      return { status: "success", message: "Changes saved. The pricing page is updated.", data: { id: previous.id } };
    }

    // New plans get a unique slug derived from the name.
    const base = slugify(input.name) || "plan";
    const taken = new Set((await cmsList("pricing_plans")).map((p) => p.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    await assertUniqueSlug("pricing_plans", slug);

    const saved = await cmsCreate("pricing_plans", { ...input, slug, currency: "USD" });
    revalidateAll(PATHS);
    return { status: "success", message: "Plan created.", data: { id: saved.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setPricingPlanActiveAction(id: string, active: boolean): Promise<Result> {
  await requireUser("content:write");
  try {
    await cmsUpdate("pricing_plans", id, { active });
    revalidateAll([...PATHS, `/admin/pricing/${id}`]);
    return { status: "success", message: active ? "Plan is live on the pricing page." : "Plan hidden from the pricing page.", data: { id } };
  } catch (error) {
    return failure(error);
  }
}

export async function deletePricingPlanAction(id: string): Promise<Result> {
  await requireUser("content:write");
  try {
    await cmsDelete("pricing_plans", id);
    revalidateAll(PATHS);
    return { status: "success", message: "Plan deleted." };
  } catch (error) {
    return failure(error);
  }
}
