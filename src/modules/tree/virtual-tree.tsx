import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";

import { treeAtom } from "@/store/tree";
import { TreeNodeLiContent } from "./tree-node";
import { EmptyNodeInfoCard } from "./empty-node-info";
import { useExpandedSync } from "./hooks/useExpandSync";
import { useVirtualTree } from "./hooks/useVirtualTree";
import { Overlay } from "./overlay";
import { Search } from "./search";

import "./tree.css";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/common/utils/cn";
import type { Rank } from "@/common/types/api";
import { useChallengeAudio } from "./hooks/use-challenge-audio";
import { useShortcutScroll } from "./hooks/use-shortcut-scroll";
import { Challenges } from "@/app/challenges";

export const VirtualTree = () => {
  useExpandedSync();
  useChallengeAudio();

  const parentRef = useRef<HTMLDivElement>(null);
  const nodes = useAtomValue(treeAtom.nodes);
  const roots = useAtomValue(treeAtom.rootKeys);
  const challengeMode = useAtomValue(treeAtom.challenge).mode;
  const scrollToRank = useAtomValue(treeAtom.scrollToRank);
  const lastScrolledRank = useRef<Rank | null>(null);

  const { isTablet } = useResponsive();

  const { flattened, rowVirtualizer, connectors } = useVirtualTree(
    nodes,
    roots,
    parentRef,
  );

  useEffect(() => {
    if (!scrollToRank || scrollToRank === lastScrolledRank.current) return;

    lastScrolledRank.current = scrollToRank;

    const targetIndex = flattened.findIndex(
      (item) => nodes[item.key]?.rank === scrollToRank,
    );

    if (targetIndex === -1) return;

    rowVirtualizer.scrollToIndex(targetIndex, {
      align: "center",
      behavior: "smooth",
    });
  }, [scrollToRank, flattened, nodes, rowVirtualizer]);

  useShortcutScroll(flattened, rowVirtualizer);

  return (
    <>
      <div className="mb-4 px-4">
        {challengeMode && isTablet && <Challenges />}

        {!challengeMode && <Search />}
      </div>

      <div
        ref={parentRef}
        className={cn(
          "h-[calc(100dvh-144px)] w-full overflow-auto px-4 pb-28",
          challengeMode && !isTablet && "h-[calc(100dvh-130px)]",
          challengeMode === "UNSET" && "pointer-events-none opacity-40",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ul
          style={{ height: rowVirtualizer.getTotalSize() }}
          className="relative w-full"
        >
          <Overlay
            connectors={connectors}
            totalHeight={rowVirtualizer.getTotalSize()}
          />

          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = flattened[virtualItem.index];
            return (
              <li
                key={item.key}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {item.isEmptyInfo ? (
                  <EmptyNodeInfoCard
                    parentNodeKey={item.parentNodeKey!}
                    level={item.level}
                  />
                ) : (
                  <TreeNodeLiContent nodeKey={item.key} level={item.level} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
