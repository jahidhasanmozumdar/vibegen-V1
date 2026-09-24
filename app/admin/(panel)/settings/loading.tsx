import { Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading settings">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="space-y-4 rounded-[16px] border border-hair bg-white p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-2/3" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
