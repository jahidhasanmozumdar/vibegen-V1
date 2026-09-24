import { Skeleton, TableSkeleton } from "@/components/ui/states";

function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <Skeleton className="h-8 w-56" />
    </div>
  );
}

/** Loading placeholder for admin list pages (toolbar + table). */
export function ListPageSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div role="status" aria-label="Loading">
      <HeaderSkeleton />
      <div className="mb-4 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
      <TableSkeleton rows={8} columns={columns} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Loading placeholder for record detail pages (header + two columns). */
export function DetailPageSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <HeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 rounded-[16px] border border-hair bg-white p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3 rounded-[16px] border border-hair bg-white p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Loading placeholder for the overview / analytics dashboards. */
export function DashboardSkeleton({ kpis = 6 }: { kpis?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <HeaderSkeleton />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: kpis }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-[16px] border border-hair bg-white p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="rounded-[16px] border border-hair bg-white p-5">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-56 w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3 rounded-[16px] border border-hair bg-white p-5">
            <Skeleton className="h-4 w-32" />
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
