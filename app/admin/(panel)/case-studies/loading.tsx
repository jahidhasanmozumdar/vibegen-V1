import { Skeleton, TableSkeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-40" />
      </div>
      <TableSkeleton rows={8} columns={6} />
    </>
  );
}
