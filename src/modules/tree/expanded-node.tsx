import type { Taxon } from "@/common/types/api";
import { getNextRank } from "@/common/utils/ranks";
import { useGetChildren } from "@/hooks/queries/useGetChildren";

import { useAtomValue } from "jotai";
import { memo, useEffect, useMemo, useState } from "react";

import { NodeSpecie } from "@/modules/tree/species-node";
import { TreeNode } from "./tree-node";
import { treeAtom } from "@/store/tree";
import { LoaderCircle } from "lucide-react";
import { kingdomColors } from "@/common/utils/dataFake";

export const ExpandedNode = memo(({ taxon }: { taxon: Taxon }) => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const currentNode = expandedNodes.find((node) => node.rank === taxon.rank);
  const isExpanded = currentNode?.key === taxon.key;

  const [isBuilding, setIsBuilding] = useState(false);

  const { data: children, isLoading } = useGetChildren({
    parentKey: taxon.key,
    expanded: isExpanded,
    numDescendants: taxon.numDescendants,
  });

  const filteredChildren = useMemo(() => {
    const nextRank = getNextRank(taxon.rank);
    if (!children) return [];

    const result = children.filter(
      (child) => child.rank.toLowerCase() === nextRank?.toLowerCase(),
    );

    if (result.length === 0 && children.length > 0) {
      console.warn(
        `Rank inconsistente detectado para '${taxon.scientificName}' (esperado: ${nextRank}, encontrados: ${[
          ...new Set(children.map((c) => c.rank)),
        ].join(", ")})`,
      );

      return children;
    }

    return result;
  }, [children, taxon.rank, taxon.scientificName]);

  useEffect(() => {
    if (!isLoading && filteredChildren.length > 0) {
      setIsBuilding(true);
      const t = setTimeout(() => {
        setIsBuilding(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isLoading, filteredChildren]);

  if (isLoading || isBuilding) {
    return (
      <div className="ml-8 flex items-center">
        <LoaderCircle
          className="animate-spin"
          style={{
            color: kingdomColors[taxon.kingdom as "Animalia"][1],
          }}
        />
      </div>
    );
  }

  if (filteredChildren.length === 0) {
    return (
      <div className="flex max-w-xl flex-col items-center justify-center rounded-2xl border-1 p-6 text-center shadow-md">
        <h1 className="mb-4 text-2xl font-semibold">
          Informações não encontradas
        </h1>

        <div className="mb-4 w-full rounded-lg border-1 p-4">
          <p className="text-sm">
            Os dados são fornecidos pela API da <strong>GBIF</strong>, e podem
            estar incompletos ou ausentes.
          </p>
        </div>

        <p className="text-sm text-gray-600">
          Você pode tentar buscar mais informações no Google pesquisando por:{" "}
          <span className="text-blue-600 underline hover:cursor-pointer">
            {taxon.scientificName || taxon.canonicalName}
          </span>
        </p>
      </div>
    );
  }

  return (
    <ul>
      {filteredChildren.map((child) => {
        if (child.rank === "SPECIES") {
          return <NodeSpecie key={taxon.rank + child.key} taxon={child} />;
        }
        return <TreeNode key={taxon.rank + child.key} taxon={child} />;
      })}
    </ul>
  );
});
