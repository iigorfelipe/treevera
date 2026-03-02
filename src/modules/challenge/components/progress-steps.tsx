import { cn } from "@/common/utils/cn";
import { motion } from "framer-motion";

export const ProgressSteps = ({
  correctSteps,
  errorIndex,
  totalSteps,
}: {
  correctSteps: number;
  errorIndex: number | null;
  totalSteps: number;
}) => (
  <div className="mt-2 flex items-center gap-1">
    {Array.from({ length: totalSteps }).map((_, i) => {
      const isCorrect = i < correctSteps;
      const isError = i === errorIndex;
      const isNext = i === correctSteps && errorIndex === null;

      return (
        <motion.div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            isCorrect
              ? "bg-emerald-500"
              : isError
                ? "bg-red-500"
                : isNext
                  ? "bg-emerald-300 dark:bg-emerald-700"
                  : "bg-muted",
          )}
          animate={
            isError
              ? { x: [-3, 3, -2, 2, 0] }
              : isNext
                ? { opacity: [0.4, 1, 0.4] }
                : {}
          }
          transition={
            isError
              ? { duration: 0.3 }
              : isNext
                ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                : {}
          }
        />
      );
    })}
  </div>
);
