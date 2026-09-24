import { Skeleton } from "@/components/ui/states";

/** loading.tsx body for CMS editor routes. */
export function EditorSkeleton() {
  return (
    <div role="status" aria-label="Loading editor">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-4 rounded-[16px] border border-hair bg-white p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-[16px] border border-hair bg-white p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
