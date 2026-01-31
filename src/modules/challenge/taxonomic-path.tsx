import { Badge } from "@/common/components/ui/badge";
import type { Rank } from "@/common/types/api";
import { cn } from "@/common/utils/cn";
import {
  getDailySpecies,
  speciesPaths,
} from "@/common/utils/game/daily-species";

import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Lock } from "lucide-react";

const ranks: Rank[] = [
  "KINGDOM",
  "PHYLUM",
  "CLASS",
  "ORDER",
  "FAMILY",
  "GENUS",
  "SPECIES",
];

type TaxonomicPathProps = {
  activeIndex?: number;
};

export const TaxonomicPath = ({ activeIndex }: TaxonomicPathProps) => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const speciesName = getDailySpecies();
  const correctPath = speciesPaths[speciesName] || [];

  const getStatus = (index: number, rank: Rank) => {
    const node = expandedNodes[index];
    const expected = correctPath[index];

    if (!node) return "locked";
    if (node.rank !== rank) return "locked";
    if (expected && node.name === expected.name) return "success";
    return "error";
  };

  return (
    <div className="bg-accent/40 rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Caminho Taxonômico</h3>
        <span className="text-muted-foreground text-sm">
          {expandedNodes.length}/7 interações
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranks.map((rank, index) => {
          const status = getStatus(index, rank);
          const isActive = activeIndex === index;

          return (
            <motion.div
              key={rank}
              layout
              animate={isActive ? { scale: 1.03 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 transition-all",
                status === "success" && "border-green-500 bg-green-500/10",
                status === "error" && "border-red-500 bg-red-500/10",
                status === "locked" && "opacity-60",
                isActive && "ring-2 ring-emerald-400",
              )}
            >
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">{rank}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-1 w-fit",
                    status === "success" && "bg-green-500 text-white",
                    status === "error" && "bg-red-500 text-white",
                  )}
                >
                  {status === "locked" ? "?" : expandedNodes[index]?.name}
                </Badge>
              </div>

              {status === "success" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {status === "error" && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {status === "locked" && (
                <Lock className="text-muted-foreground h-4 w-4" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
