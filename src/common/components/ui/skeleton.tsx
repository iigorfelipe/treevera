import { cn } from "@/common/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-bounce cursor-wait rounded-md",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
