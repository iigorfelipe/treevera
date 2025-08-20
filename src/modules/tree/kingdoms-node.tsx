import type { Taxon } from "@/common/types/api";
import { getRankIcon } from "@/common/utils/ranks";
import { useGetChildren } from "@/hooks/queries/useGetChildren";

import { useAtomValue } from "jotai";
import { memo, useMemo } from "react";

import { TooltipNode } from "./components/tooltip-node";
import { formatNumber } from "@/common/utils/format";
import { cn } from "@/common/utils/cn";
import { treeAtom } from "@/store/tree";
import { Image } from "@/common/components/image";
import { kingdomColors } from "@/common/utils/dataFake";

export const KingdomNode = memo(({ taxon }: { taxon: Taxon }) => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const { isShaking, shakeDirection } = useAtomValue(treeAtom.animate);

  const currentNodeIndex = expandedNodes.findIndex(
    (node) => node.key === taxon.key && node.rank === taxon.rank,
  );

  const currentNode = expandedNodes[currentNodeIndex];
  const isExpanded = currentNode?.key === taxon.key;

  const { isLoading } = useGetChildren({
    parentKey: taxon.key,
    expanded: isExpanded,
    numDescendants: taxon.numDescendants,
  });

  const isLoadNode = useMemo(
    () => isLoading && isExpanded,
    [isExpanded, isLoading],
  );

  const imgRotationClass = useMemo(() => {
    if (isLoadNode) return "animate-wiggle";
    if (isShaking) return shakeDirection ? "rotate-6" : "-rotate-6";
    return "rotate-0";
  }, [isLoadNode, isShaking, shakeDirection]);

  const hoverRotationClass = useMemo(() => {
    return isShaking ? "" : "group-hover:rotate-6";
  }, [isShaking]);

  return (
    <div
      className={cn(
        "group flex min-w-2xs cursor-pointer items-center gap-4 rounded-lg p-3",
        isExpanded && "rounded-bl-none border-2",
        isExpanded && kingdomColors[currentNode.kingdom as "Animalia"][0],
        !isExpanded && "hover:bg-accent",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl",
          !isExpanded && "group-hover:bg-accent bg-accent",
        )}
      >
        <div
          className={cn(
            "flex size-11 items-center justify-center overflow-hidden rounded-lg p-3",
          )}
        >
          <Image
            src={getRankIcon(taxon.kingdom)}
            alt={taxon.scientificName}
            className={cn(
              "h-full w-full transition-transform duration-150 group-hover:scale-150",
              imgRotationClass,
              hoverRotationClass,
              isExpanded && "scale-150",
              isLoadNode && "animate-wiggle",
            )}
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-1">
        <div className="flex flex-col">
          <h1 className={cn("text-md font-medium", isExpanded && "font-bold")}>
            {taxon.canonicalName || taxon.scientificName}
          </h1>
          <TooltipNode
            trigger={
              <span className="text-xs">
                {formatNumber(taxon.numDescendants)} <span>descendentes</span>
              </span>
            }
            content={
              <span className="text-sm">
                Valor aproximado, podendo ser maior que o número real.
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
});
