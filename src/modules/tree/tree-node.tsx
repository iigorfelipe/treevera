import type { Taxon } from "@/common/types/api";
import { useGetChildren } from "@/hooks/queries/useGetChildren";

import { useAtom, useSetAtom } from "jotai";
import { memo, useCallback } from "react";

import { ExpandedNode } from "@/modules/tree/expanded-node";
import { treeAtom } from "@/store/tree";
import { kingdomColors } from "@/common/utils/dataFake";
import { KingdomNode } from "./kingdoms-node";
import { useAutoScroll } from "./hooks/auto-scroll";
import { MainNode } from "./main-node";

export const TreeNode = memo(({ taxon }: { taxon: Taxon }) => {
  const [expandedNodes, setExpandedNodes] = useAtom(treeAtom.expandedNodes);
  const setTreeAnimate = useSetAtom(treeAtom.animate);

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

  const { ref } = useAutoScroll({
    currentNodeIndex,
    isExpanded,
    isLoading,
    taxonKey: taxon.key,
  });

  const handleAnimate = useCallback(() => {
    setTreeAnimate({
      isShaking: true,
      shakeDirection: true,
    });

    setTimeout(
      () =>
        setTreeAnimate((prev) => {
          return {
            ...prev,
            shakeDirection: false,
          };
        }),
      150,
    );
    setTimeout(
      () =>
        setTreeAnimate((prev) => {
          return {
            ...prev,
            isShaking: false,
          };
        }),
      300,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      handleAnimate();
      setExpandedNodes((prev) => {
        if (taxon.rank === "KINGDOM") {
          if (prev.length === 0 || prev[0].key !== taxon.key) {
            return [
              { rank: "KINGDOM", key: taxon.key, kingdom: taxon.kingdom },
            ];
          }
          return [];
        }

        const idx = prev.findIndex((n) => n.rank === taxon.rank);
        if (idx !== -1) {
          if (prev[idx].key === taxon.key) {
            return prev.slice(0, idx);
          } else {
            return [
              ...prev.slice(0, idx),
              { rank: taxon.rank, key: taxon.key, kingdom: taxon.kingdom },
            ];
          }
        }

        return [
          ...prev,
          { rank: taxon.rank, key: taxon.key, kingdom: taxon.kingdom },
        ];
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleAnimate, taxon.rank, taxon.key, taxon.kingdom],
  );

  return (
    <li
      ref={ref}
      className={`${taxon.rank === "PHYLUM" ? "ml-3.5" : "tree ml-0"}`}
      style={
        {
          "--tree-color": `${kingdomColors[taxon.kingdom as "Animalia"][1]}`,
        } as React.CSSProperties
      }
    >
      <details open={isExpanded}>
        <summary onClick={handleClick}>
          {taxon.rank === "KINGDOM" ? (
            <KingdomNode taxon={taxon} />
          ) : (
            <MainNode taxon={taxon} />
          )}
        </summary>

        {isExpanded && <ExpandedNode taxon={taxon} />}
      </details>
    </li>
  );
});
