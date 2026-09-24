import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";

import { ListFilters } from "@/components/admin/cms/list-filters";
import { listHref, matchesQuery, paginate, readListQuery, sortRowsBy } from "@/components/admin/cms/list-query";
import { CmsRowActions } from "@/components/admin/cms/row-actions";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { ResponsiveTable, SortableTH, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { deleteBlogPostAction, setBlogPostStatusAction } from "@/lib/actions/admin/cms-blog";
import { can, requireUser } from "@/lib/auth/session";
import { blogStatusLabels, toOptions } from "@/lib/data/labels";
import { cmsList } from "@/lib/services/admin/cms";
import { formatDate, formatRelative } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Blog" };

const SORTS = ["title", "status", "published_at", "updated_at"] as const;
const PAGE_SIZE = 20;

export default async function BlogListPage(props: PageProps<"/admin/blog">) {
  const user = await requireUser();
  const canEdit = can(user, "content:write");
  const query = readListQuery(await props.searchParams, { sorts: SORTS, defaultSort: "updated_at", filters: ["status", "category", "demo"] });

  const [posts, categories] = await Promise.all([cmsList("blog_posts"), cmsList("blog_categories", "name", true)]);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  const filtered = posts.filter(
    (p) =>
      matchesQuery(query.q, p.title, p.slug, p.excerpt, p.author, p.tags.join(" ")) &&
      (!query.filters.status || p.status === query.filters.status) &&
      (!query.filters.category || p.category_id === query.filters.category) &&
      (!query.filters.demo || (query.filters.demo === "demo") === p.is_demo),
  );
  const sorted = sortRowsBy(filtered, (p) => p[query.sort], query.dir);
  const { items, page, pageCount, total } = paginate(sorted, query.page, PAGE_SIZE);
  const href = (patch: Parameters<typeof listHref>[2]) => listHref("/admin/blog", query, patch);

  const createButton = canEdit ? (
    <ButtonLink href="/admin/blog/new" icon={<Plus className="size-4" />}>
      Create Blog Post
    </ButtonLink>
  ) : null;

  const actionsFor = (p: (typeof items)[number]) =>
    canEdit ? (
      <CmsRowActions
        label={p.title}
        editHref={`/admin/blog/${p.id}`}
        viewHref={p.status === "published" ? `/blog/${p.slug}` : null}
        toggle={{
          active: p.status !== "draft",
          activateLabel: "Publish",
          deactivateLabel: "Unpublish",
          run: setBlogPostStatusAction.bind(null, p.id, p.status === "draft" ? "published" : "draft"),
        }}
        onDelete={deleteBlogPostAction.bind(null, p.id)}
      />
    ) : null;

  return (
    <>
      <PageHeader title="Blog" description={`${posts.length} post${posts.length === 1 ? "" : "s"} · Markdown articles for /blog`} actions={createButton} />

      {posts.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="size-5" />}
          title="No blog posts yet."
          description="Write your first article, or install the starter posts from Settings → Data."
          action={createButton}
        />
      ) : (
        <>
          <ListFilters
            placeholder="Search title, tag, author…"
            filters={[
              { key: "status", label: "Statuses", options: toOptions(blogStatusLabels) },
              { key: "category", label: "Categories", options: categories.map((c) => ({ value: c.id, label: c.name })) },
              { key: "demo", label: "Records", options: [{ value: "real", label: "Real content" }, { value: "demo", label: "Demo data" }] },
            ]}
          />
          {total === 0 ? (
            <EmptyState title="No posts match these filters." description="Try a different search or clear the filters." />
          ) : (
            <>
              <ResponsiveTable
                table={
                  <Table>
                    <THead>
                      <tr>
                        <SortableTH label="Title" column="title" currentSort={query.sort} currentDir={query.dir} href={(sort, dir) => href({ sort: sort as (typeof SORTS)[number], dir, page: 1 })} />
                        <TH>Category</TH>
                        <SortableTH label="Status" column="status" currentSort={query.sort} currentDir={query.dir} href={(sort, dir) => href({ sort: sort as (typeof SORTS)[number], dir, page: 1 })} />
                        <SortableTH label="Published" column="published_at" currentSort={query.sort} currentDir={query.dir} href={(sort, dir) => href({ sort: sort as (typeof SORTS)[number], dir, page: 1 })} />
                        <SortableTH label="Updated" column="updated_at" currentSort={query.sort} currentDir={query.dir} href={(sort, dir) => href({ sort: sort as (typeof SORTS)[number], dir, page: 1 })} />
                        <TH className="w-12">
                          <span className="sr-only">Actions</span>
                        </TH>
                      </tr>
                    </THead>
                    <tbody>
                      {items.map((p) => (
                        <TR key={p.id}>
                          <TD className="max-w-md">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/blog/${p.id}`} className="truncate font-medium text-fg underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-[#0a6cff]">
                                {p.title}
                              </Link>
                              {p.is_demo && <DemoBadge />}
                            </div>
                            <p className="truncate font-mono text-xs text-fg-3">/blog/{p.slug}</p>
                          </TD>
                          <TD>{p.category_id ? (categoryName.get(p.category_id) ?? "—") : "—"}</TD>
                          <TD>
                            <StatusBadge kind="publish" value={p.status} />
                          </TD>
                          <TD className="tabular whitespace-nowrap">{formatDate(p.published_at)}</TD>
                          <TD className="tabular whitespace-nowrap text-fg-2">{formatRelative(p.updated_at)}</TD>
                          <TD className="text-right">{actionsFor(p)}</TD>
                        </TR>
                      ))}
                    </tbody>
                  </Table>
                }
                cards={items.map((p) => (
                  <li key={p.id} className="rounded-[16px] border border-hair bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/blog/${p.id}`} className="min-w-0 font-medium text-fg">
                        {p.title}
                      </Link>
                      {actionsFor(p)}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-fg-2">
                      <StatusBadge kind="publish" value={p.status} />
                      {p.is_demo && <DemoBadge />}
                      <span>{p.category_id ? categoryName.get(p.category_id) : "No category"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular">Updated {formatRelative(p.updated_at)}</span>
                    </div>
                  </li>
                ))}
              />
              <Pagination page={page} pageCount={pageCount} total={total} pageSize={PAGE_SIZE} href={(n) => href({ page: n })} />
            </>
          )}
        </>
      )}
    </>
  );
}
