"use server";

import { requireUser } from "@/lib/auth/session";
import type { ActionState, PublishStatus } from "@/lib/data/types";
import { assertUniqueSlug, cmsCreate, cmsDelete, cmsGet, cmsUpdate } from "@/lib/services/admin/cms";
import { caseStudySchema, fieldErrors, formDataToObject, metricListSchema, parseJsonField } from "@/lib/validation/schemas";
import { failure, idFrom, invalid, resolvePublishedAt, revalidateAll } from "./cms-shared";

type Result = ActionState<{ id: string }>;

function casePaths(slug?: string | null, previousSlug?: string | null) {
  return [
    "/admin/case-studies",
    "/case-studies",
    slug && `/case-studies/${slug}`,
    previousSlug && previousSlug !== slug && `/case-studies/${previousSlug}`,
    "/",
    "/sitemap.xml",
  ];
}

export async function saveCaseStudyAction(_prev: Result, formData: FormData): Promise<Result> {
  await requireUser("content:write");
  const id = idFrom(formData);
  const raw = formDataToObject(formData, ["services"]);
  if (typeof raw.published_at === "string" && raw.published_at && Number.isNaN(new Date(raw.published_at).getTime())) delete raw.published_at;

  const parsed = caseStudySchema.safeParse(raw);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const { metrics_json, ...input } = parsed.data;

  const metrics = parseJsonField(metrics_json, metricListSchema, []);
  if (!metrics.ok) return invalid({ metrics_json: ["Some metric rows are invalid. Keep labels under 100 characters and values under 60."] });

  try {
    const previous = id ? await cmsGet("case_studies", id) : null;
    if (id && !previous) return { status: "error", message: "That case study no longer exists." };
    await assertUniqueSlug("case_studies", input.slug, id ?? undefined);

    const row = {
      ...input,
      industry: input.industry ?? null,
      metrics: metrics.value.filter((m) => m.label.trim()),
      published_at: resolvePublishedAt(input.status, input.published_at, previous?.published_at ?? null),
    };
    const saved = previous ? await cmsUpdate("case_studies", previous.id, row) : await cmsCreate("case_studies", row);
    revalidateAll([...casePaths(saved.slug, previous?.slug), `/admin/case-studies/${saved.id}`]);
    return { status: "success", message: previous ? "Changes saved." : "Case study created.", data: { id: saved.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setCaseStudyStatusAction(id: string, status: PublishStatus): Promise<Result> {
  await requireUser("content:write");
  try {
    const row = await cmsGet("case_studies", id);
    if (!row) return { status: "error", message: "That case study no longer exists." };
    await cmsUpdate("case_studies", id, { status, published_at: resolvePublishedAt(status, null, row.published_at) });
    revalidateAll([...casePaths(row.slug), `/admin/case-studies/${id}`]);
    return { status: "success", message: status === "published" ? "Case study published." : "Case study unpublished.", data: { id } };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteCaseStudyAction(id: string): Promise<Result> {
  await requireUser("content:write");
  try {
    const row = await cmsGet("case_studies", id);
    if (row) {
      await cmsDelete("case_studies", id);
      revalidateAll(casePaths(row.slug));
    }
    return { status: "success", message: "Case study deleted." };
  } catch (error) {
    return failure(error);
  }
}
