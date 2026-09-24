import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { deleteBlogPostAction, setBlogPostStatusAction } from "@/lib/actions/admin/cms-blog";
import { requireUser } from "@/lib/auth/session";
import { cmsGet, cmsList } from "@/lib/services/admin/cms";
import { formatDateTime } from "@/lib/utils/format";
import { BlogEditor } from "../blog-editor";

export const metadata: Metadata = { title: "Edit blog post" };

export default async function EditBlogPostPage(props: PageProps<"/admin/blog/[id]">) {
  const user = await requireUser("content:write");
  const { id } = await props.params;
  const [post, categories] = await Promise.all([cmsGet("blog_posts", id), cmsList("blog_categories", "name", true)]);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        title={post.title}
        demo={post.is_demo}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusBadge kind="publish" value={post.status} />
            <span>Last updated {formatDateTime(post.updated_at)}</span>
          </span>
        }
        actions={
          post.status === "published" ? (
            <ButtonLink href={`/blog/${post.slug}`} target="_blank" variant="outline" size="sm" iconRight={<ExternalLink className="size-3.5" />}>
              View live
            </ButtonLink>
          ) : null
        }
      />
      <BlogEditor
        post={post}
        categories={categories}
        defaultAuthor={user.name}
        onDelete={deleteBlogPostAction.bind(null, post.id)}
        onToggle={setBlogPostStatusAction.bind(null, post.id, post.status === "draft" ? "published" : "draft")}
      />
    </>
  );
}
