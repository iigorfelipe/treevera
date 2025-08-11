import type { Taxon } from "@/common/types/api";
import { capitalizar } from "@/common/utils/string";
import { useAtom } from "jotai";
import { memo } from "react";

import { TooltipNode } from "./components/tooltip-node";
import { cn } from "@/lib/utils";
import { treeAtom } from "@/store/tree";
import { Badge } from "@/components/ui/badge";

export const NodeSpecie = memo(({ taxon }: { taxon: Taxon }) => {
  const [expandedNodes, setExpandedNodes] = useAtom(treeAtom.expandedNodes);
  const specieKey = expandedNodes.find((node) => node.rank === "SPECIES")?.key;
  const isSelected = specieKey === taxon.key;

  const handleClick = () => {
    setExpandedNodes((prev) => {
      const idx = prev.findIndex((n) => n.rank === "SPECIES");
      const newArr = idx !== -1 ? prev.slice(0, idx) : prev;
      return [
        ...newArr,
        { rank: "SPECIES", key: taxon.key, kingdom: taxon.kingdom },
      ];
    });
  };

  return (
    <li key={taxon.key} onClick={handleClick} className="group w-full">
      <div
        className={cn(
          "item flex w-full items-center justify-between transition-colors duration-200",
        )}
      >
        <div className="flex items-center gap-2">
          <TooltipNode
            trigger={
              <i
                className={cn(
                  "w-max transition-transform duration-200 ease-in-out group-hover:scale-105",
                  isSelected && "font-bold",
                )}
              >
                {taxon.canonicalName || taxon.scientificName}
              </i>
            }
            content={
              <span>
                Canonical name: <i>{taxon.canonicalName}</i>
                <br />
                Scientific name: <i>{taxon.scientificName}</i>
              </span>
            }
          />

          <Badge
            className={cn(
              "bg-primary-foreground text-primary mr-auto flex items-center gap-1 rounded-xl px-1 py-[0px] text-[11px] opacity-0 outline-1 group-hover:opacity-100",
              isSelected && "font-bold opacity-100",
            )}
          >
            {capitalizar(taxon.rank.slice(0, -1))}
          </Badge>
        </div>

        <>&nbsp;</>
      </div>
    </li>
  );
});
