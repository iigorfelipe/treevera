import type { Taxon } from "@/common/types/api";
import { getDisplayRank } from "@/common/utils/ranks";

import { useAtom } from "jotai";
import { memo, useMemo } from "react";

import { TooltipNode } from "./components/tooltip-node";
import { cn } from "@/lib/utils";
import { treeAtom } from "@/store/tree";
import { Badge } from "@/components/ui/badge";

export const MainNode = memo(({ taxon }: { taxon: Taxon }) => {
  const [expandedNodes] = useAtom(treeAtom.expandedNodes);

  const currentNodeIndex = expandedNodes.findIndex(
    (node) => node.key === taxon.key && node.rank === taxon.rank,
  );

  const currentNode = expandedNodes[currentNodeIndex];
  const isExpanded = currentNode?.key === taxon.key;

  const classificação = useMemo(() => getDisplayRank(taxon), [taxon]);

  return (
    <div className="item group flex flex-row items-center gap-2">
      <div className="flex w-full items-center justify-between gap-2">
        <TooltipNode
          trigger={
            <span
              className={cn("group-hover:font-bold", isExpanded && "font-bold")}
            >
              {taxon.canonicalName || taxon.scientificName}
            </span>
          }
          content={
            taxon.canonicalName !== taxon.scientificName && (
              <span>
                Canonical name: <i>{taxon.canonicalName}</i>
                <br />
                Scientific name: <i>{taxon.scientificName}</i>
              </span>
            )
          }
        />

        <Badge
          className={cn(
            "bg-primary-foreground text-primary mr-auto hidden items-center gap-1 rounded-xl px-1 py-[1px] text-[11px] outline-1 group-hover:flex group-hover:font-bold",
            isExpanded && "flex font-bold",
          )}
        >
          {classificação.name}
        </Badge>

        <TooltipNode
          trigger={
            <span className="text-xs group-hover:font-bold">
              {taxon.numDescendants &&
                taxon.numDescendants.toLocaleString("pt-BR")}
            </span>
          }
          content={
            <span className="text-sm">
              Descendentes aproximado, podendo ser maior que o número real.
            </span>
          }
        />
      </div>
    </div>
  );
});
