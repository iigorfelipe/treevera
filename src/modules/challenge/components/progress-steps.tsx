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

      return (
        <motion.div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            isCorrect ? "bg-emerald-500" : isError ? "bg-red-500" : "bg-muted",
          )}
          animate={isError ? { x: [-3, 3, -2, 2, 0] } : {}}
          transition={{ duration: 0.3 }}
        />
      );
    })}
  </div>
);
