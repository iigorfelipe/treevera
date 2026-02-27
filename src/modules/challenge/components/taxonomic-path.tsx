import type { Rank } from "@/common/types/api";
import { cn } from "@/common/utils/cn";

import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

type TaxonomicPathProps = {
  correctPath: Array<{ rank: Rank; name: string }>;
  activeIndex?: number;
  currentStep: number;
};

export const TaxonomicPath = ({
  correctPath,
  activeIndex,
  currentStep,
}: TaxonomicPathProps) => {
  const { t } = useTranslation();
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  const getStatus = (index: number) => {
    const node = expandedNodes[index];
    const expected = correctPath[index];

    if (!node) return "locked";
    if (expected && node.name === expected.name) return "success";
    return "error";
  };

  if (correctPath.length === 0) return null;

  return (
    <div className="bg-accent/40 rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t("challenge.taxonomicPath")}
        </h3>
        <div>
          <span className="text-xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
            {currentStep}
          </span>
          <span className="text-muted-foreground text-sm font-medium">
            /{correctPath.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {correctPath.map((entry, index) => {
          const status = getStatus(index);
          const isActive = activeIndex === index;
          const isLast = index === correctPath.length - 1;

          return (
            <motion.div
              key={`${entry.rank}-${index}`}
              layout
              animate={
                isActive
                  ? { scale: 1 }
                  : status === "error"
                    ? { x: [-4, 4, -3, 3, 0] }
                    : { scale: 1 }
              }
              transition={
                status === "error"
                  ? { duration: 0.3 }
                  : { type: "spring", stiffness: 300, damping: 20 }
              }
              className={cn(
                "flex items-center justify-between rounded-xl border p-3 transition-all",
                isLast && "col-span-2",
                status === "success" && "border-green-500/60 bg-green-500/10",
                status === "error" && "border-red-400/60 bg-red-500/10",
                status === "locked" && "border-dashed opacity-50",
                isActive && "ring-2 ring-emerald-400",
              )}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                  {entry.rank}
                </span>
                <span
                  className={cn(
                    "mt-0.5 truncate text-xs font-medium",
                    status === "success" &&
                      "text-green-600 dark:text-green-400",
                    status === "error" && "text-red-500",
                    status === "locked" && "text-muted-foreground",
                  )}
                >
                  {status === "locked" ? "—" : expandedNodes[index]?.name}
                </span>
              </div>

              <div className="ml-2 shrink-0">
                {status === "success" && (
                  <CheckCircle2 className="size-4 text-green-500" />
                )}
                {status === "error" && (
                  <AlertTriangle className="size-4 text-red-500" />
                )}
                {status === "locked" && (
                  <Lock className="text-muted-foreground/40 size-3" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
