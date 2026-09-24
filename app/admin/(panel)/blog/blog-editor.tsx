"use client";

import { useActionState, useState } from "react";

import { ContentFormShell, EditorSection, useSyncedState, type SaveState } from "@/components/admin/cms/content-form-shell";
import { DateTimeField } from "@/components/admin/cms/datetime-field";
import { MarkdownEditor } from "@/components/admin/cms/markdown-editor";
import { DeleteButton } from "@/components/admin/cms/row-actions";
import { SeoFieldset } from "@/components/admin/cms/seo-fieldset";
import { TitleSlugFields } from "@/components/admin/cms/slug-input";
import { Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { blogStatusLabels, toOptions } from "@/lib/data/labels";
import type { BlogCategory, BlogPost, BlogStatus } from "@/lib/data/types";
import { saveBlogPostAction } from "@/lib/actions/admin/cms-blog";

const initial: SaveState = { status: "idle" };

const statusHints: Record<BlogStatus, string> = {
  draft: "Only visible in the admin.",
  published: "Live on /blog now. Leave the date empty to use the current time.",
  scheduled: "Goes live automatically at the date and time below.",
};

export function BlogEditor({
  post,
  categories,
  defaultAuthor,
  onDelete,
  onToggle,
}: {
  post: BlogPost | null;
  categories: BlogCategory[];
  defaultAuthor: string;
  onDelete?: () => Promise<SaveState>;
  onToggle?: () => Promise<SaveState>;
}) {
  const [state, action, pending] = useActionState(saveBlogPostAction, initial);
  const [status, setStatus] = useSyncedState<BlogStatus>(post?.status ?? "draft");
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [image, setImage] = useState(post?.featured_image ?? "");
  const errors = state.fieldErrors ?? {};

  return (
    <ContentFormShell
      action={action}
      state={state}
      pending={pending}
      backHref="/admin/blog"
      isNew={!post}
      editHref={(id) => `/admin/blog/${id}`}
      publish={
        post && onToggle
          ? { published: post.status === "published" || post.status === "scheduled", unpublishLabel: "Unpublish", publishLabel: "Publish now", run: onToggle }
          : undefined
      }
      extraActions={post && onDelete ? <DeleteButton label={post.title} onDelete={onDelete} redirectTo="/admin/blog" /> : undefined}
      aside={
        <>
          <EditorSection title="Publishing">
            <Field id="status" label="Status" required hint={statusHints[status]} error={errors.status}>
              <Select
                {...fieldAria("status", errors.status, true)}
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogStatus)}
                options={toOptions(blogStatusLabels)}
              />
            </Field>
            <DateTimeField
              name="published_at"
              label={status === "scheduled" ? "Go-live date" : "Publish date"}
              required={status === "scheduled"}
              defaultValue={post?.published_at}
              error={errors.published_at}
              hint={status === "draft" ? "Optional. Used when you publish." : undefined}
            />
          </EditorSection>

          <EditorSection title="Details">
            <Field id="author" label="Author" required error={errors.author}>
              <Input {...fieldAria("author", errors.author)} name="author" defaultValue={post?.author ?? defaultAuthor} maxLength={120} />
            </Field>
            <Field id="category_id" label="Category" error={errors.category_id}>
              <Select
                {...fieldAria("category_id", errors.category_id)}
                name="category_id"
                defaultValue={post?.category_id ?? ""}
                placeholder="No category"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>
            <Field id="tags" label="Tags" hint="Comma separated, e.g. ga4, tracking" error={errors.tags}>
              <Input {...fieldAria("tags", errors.tags, true)} name="tags" defaultValue={post?.tags.join(", ") ?? ""} />
            </Field>
            <Field id="featured_image" label="Featured image URL" hint="1600 × 900 px recommended." error={errors.featured_image}>
              <Input
                {...fieldAria("featured_image", errors.featured_image, true)}
                name="featured_image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://"
              />
            </Field>
            {/^https:\/\//.test(image) && (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered URL; next/image would need remotePatterns.
              <img src={image} alt="" className="aspect-video w-full rounded-[10px] border border-hair object-cover" />
            )}
          </EditorSection>
        </>
      }
    >
      {post && <input type="hidden" name="id" value={post.id} />}
      <EditorSection title="Post">
        <TitleSlugFields defaultTitle={post?.title} defaultSlug={post?.slug} prefix="/blog/" errors={errors} onTitleChange={setTitle} />
        <Field id="excerpt" label="Excerpt" required hint="One or two sentences shown on the blog index and in previews." error={errors.excerpt}>
          <Textarea
            {...fieldAria("excerpt", errors.excerpt, true)}
            name="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={320}
            className="min-h-20"
          />
        </Field>
        <MarkdownEditor name="content" label="Content" required defaultValue={post?.content ?? ""} error={errors.content} />
      </EditorSection>

      <SeoFieldset defaults={post ?? undefined} errors={errors} fallbackTitle={title} fallbackDescription={excerpt} path={`/blog/${post?.slug ?? ""}`} />
    </ContentFormShell>
  );
}
