import { Skeleton } from "@/common/components/ui/skeleton";

export const TreeSkeleton = () => {
  return (
    <div className="flex w-full min-w-1/5 flex-col gap-6 overflow-auto border-r-1 px-4 py-6">
      <Skeleton className="h-12 w-full max-w-2xs" />
      <div className="flex flex-col gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="group flex min-w-2xs items-center gap-4 rounded-lg p-3"
          >
            <Skeleton className="size-11 rounded-lg" />
            <div className="flex w-full items-center justify-between gap-1">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
