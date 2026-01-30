import { Badge } from "@/common/components/ui/badge";
import type { Rank } from "@/common/types/api";
import { cn } from "@/common/utils/cn";
import {
  getDailySpecies,
  speciesPaths,
} from "@/common/utils/game/daily-species";

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
  const speciesName = getDailySpecies();
  const correctPath = speciesPaths[speciesName] || [];

  const getBadgeClassName = (rank: Rank, index: number) => {
    const expandedNode = expandedNodes[index];
    const expected = correctPath[index];
    if (!expandedNode || expandedNode.rank !== rank) return "";
    if (expected && expandedNode.name === expected.name) {
      return "bg-green-500 text-white";
    }
    return "bg-red-500 text-white";
  };

  return (
    <div className="bg-accent/50 rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Caminho Taxonômico</h3>
        <span className="text-sm">{expandedNodes.length}/7 etapas</span>
      </div>
      <div className="flex items-center gap-2">
        {kingdoms.map((rank, index) => {
          const badgeClass = getBadgeClassName(rank, index);
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
