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
          "item flex w-full items-center gap-2 transition-colors duration-200",
        )}
      >
        <TooltipNode
          trigger={
            <i
              className={cn("group-hover:font-bold", isSelected && "font-bold")}
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
            "bg-primary-foreground text-primary hidden rounded-xl px-1 py-[1px] text-[11px] outline-1 group-hover:flex",
            isSelected && "flex font-bold",
          )}
        >
          {capitalizar(taxon.rank.slice(0, -1))}
        </Badge>
      </div>
    </li>
  );
});
