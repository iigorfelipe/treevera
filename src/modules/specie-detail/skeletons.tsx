import React from "react";

export const Skeleton = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => (
  <div
    className={`bg-skeleton bg-skeleton-size animate-skeleton rounded ${className}`}
  >
    {children}
  </div>
);

export const SkeletonText = () => (
  <div className="space-y-2">
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-1/3" />
  </div>
);

export const SkeletonTaxonomy = () => (
  <div className="grid grid-cols-2 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-1 h-4 w-1/2" />
      </div>
    ))}
  </div>
);

export const SkeletonVulnerabilityBadge = () => (
  <Skeleton className="h-6 w-32 rounded-full" />
);

export const SkeletonDescription = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonImage = () => (
  <Skeleton className="aspect-square w-full rounded-xl" />
);
