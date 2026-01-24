import { Badge } from "@/common/components/ui/badge";
import type { Rank } from "@/common/types/api";
import { cn } from "@/common/utils/cn";

import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { ChevronRight } from "lucide-react";

const kingdoms: Rank[] = [
  "KINGDOM",
  "PHYLUM",
  "CLASS",
  "ORDER",
  "FAMILY",
  "GENUS",
  "SPECIES",
];

export const TaxonomicPath = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  const getBadgeClassName = (rank: Rank) => {
    const idx = expandedNodes.findIndex((n) => n.rank === rank);
    if (idx === -1) return "";
    if (idx === expandedNodes.length - 1) {
      return "bg-blue-500 ";
    }
    return "bg-emerald-400 ";
  };

  return (
    <div className="bg-accent/50 rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Caminho Taxonômico</h3>
        <span className="text-sm">{expandedNodes.length}/7 etapas</span>
      </div>
      <div className="flex items-center gap-2">
        {kingdoms.map((rank, index) => {
          const badgeClass = getBadgeClassName(rank);

          return (
            <div key={rank} className="flex items-center">
              <Badge variant="outline" className={cn(badgeClass)}>
                {rank}
              </Badge>
              {index < kingdoms.length - 1 && (
                <ChevronRight className="mx-1 h-4 w-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};