"use server";

import { requireUser } from "@/lib/auth/session";
import type { ActionState, BlogPost, BlogStatus } from "@/lib/data/types";
import { assertUniqueSlug, cmsCreate, cmsDelete, cmsGet, cmsUpdate } from "@/lib/services/admin/cms";
import { readingMinutes } from "@/lib/utils/markdown";
import { blogPostSchema, fieldErrors, formDataToObject } from "@/lib/validation/schemas";
import { failure, idFrom, invalid, resolvePublishedAt, revalidateAll } from "./cms-shared";

type Result = ActionState<{ id: string }>;

function blogPaths(slug?: string | null, previousSlug?: string | null) {
  return ["/admin/blog", "/blog", slug && `/blog/${slug}`, previousSlug && previousSlug !== slug && `/blog/${previousSlug}`, "/", "/resources", "/sitemap.xml"];
}

/** Drop unparseable dates before Zod sees them (its transform would throw). */
function cleanDate(raw: Record<string, unknown>, key: string) {
  const v = raw[key];
  if (typeof v === "string" && v && Number.isNaN(new Date(v).getTime())) delete raw[key];
}

export async function saveBlogPostAction(_prev: Result, formData: FormData): Promise<Result> {
  await requireUser("content:write");
  const id = idFrom(formData);
  const raw = formDataToObject(formData);
  cleanDate(raw, "published_at");
  raw.tags ??= "";

  const parsed = blogPostSchema.safeParse(raw);
  if (!parsed.success) return invalid(fieldErrors(parsed.error));
  const input = parsed.data;

  if (input.status === "scheduled") {
    if (!input.published_at) return invalid({ published_at: ["Pick the date and time this post should go live."] });
    if (new Date(input.published_at).getTime() <= Date.now()) {
      return invalid({ published_at: ["A scheduled date must be in the future. Use Published to go live now."] });
    }
  }

  try {
    const previous = id ? await cmsGet("blog_posts", id) : null;
    if (id && !previous) return { status: "error", message: "That post no longer exists." };
    await assertUniqueSlug("blog_posts", input.slug, id ?? undefined);

    const row = {
      ...input,
      published_at: resolvePublishedAt(input.status, input.published_at, previous?.published_at ?? null),
      reading_minutes: readingMinutes(input.content),
    };

    const saved = previous ? await cmsUpdate("blog_posts", previous.id, row) : await cmsCreate("blog_posts", { ...row, is_demo: false });
    revalidateAll([...blogPaths(saved.slug, previous?.slug), `/admin/blog/${saved.id}`]);
    return { status: "success", message: previous ? "Changes saved." : "Blog post created.", data: { id: saved.id } };
  } catch (error) {
    return failure(error);
  }
}

export async function setBlogPostStatusAction(id: string, status: BlogStatus): Promise<Result> {
  await requireUser("content:write");
  try {
    const post = await cmsGet("blog_posts", id);
    if (!post) return { status: "error", message: "That post no longer exists." };
    const patch: Partial<BlogPost> = { status };
    if (status === "published") {
      // Publishing now: keep a past date, replace a future (scheduled) one.
      const at = post.published_at ? new Date(post.published_at).getTime() : NaN;
      patch.published_at = Number.isFinite(at) && at <= Date.now() ? post.published_at : new Date().toISOString();
    }
    await cmsUpdate("blog_posts", id, patch);
    revalidateAll([...blogPaths(post.slug), `/admin/blog/${id}`]);
    return { status: "success", message: status === "published" ? "Post published." : "Post moved to drafts.", data: { id } };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteBlogPostAction(id: string): Promise<Result> {
  await requireUser("content:write");
  try {
    const post = await cmsGet("blog_posts", id);
    if (!post) return { status: "success", message: "Post deleted." };
    await cmsDelete("blog_posts", id);
    revalidateAll(blogPaths(post.slug));
    return { status: "success", message: "Post deleted." };
  } catch (error) {
    return failure(error);
  }
}
