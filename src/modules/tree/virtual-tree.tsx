import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";

import { treeAtom } from "@/store/tree";
import { TreeNodeLiContent } from "./tree-node";
import { useExpandedSync } from "./hooks/useExpandSync";
import { useVirtualTree } from "./hooks/useVirtualTree";
import { Overlay } from "./overlay";
import { Search } from "./search";

import "./tree.css";
import { useResponsive } from "@/hooks/use-responsive";
import { DailyChallenge } from "@/app/auth/challenge";
import { cn } from "@/common/utils/cn";
import type { Rank } from "@/common/types/api";
import { useChallengeAudio } from "./hooks/use-challenge-audio";

export const VirtualTree = () => {
  useExpandedSync();
  useChallengeAudio();

  const parentRef = useRef<HTMLDivElement>(null);
  const nodes = useAtomValue(treeAtom.nodes);
  const roots = useAtomValue(treeAtom.rootKeys);
  const challenge = useAtomValue(treeAtom.challenge);
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

  return (
    <>
      <div className="mb-4 px-4">
        {challenge.mode && isTablet && <DailyChallenge />}

        {!challenge.mode && <Search />}
      </div>

      <div
        ref={parentRef}
        className={cn(
          "h-[calc(100dvh-144px)] w-full overflow-auto px-4 pb-28",
          challenge.mode && !isTablet && "h-[calc(100dvh-130px)]",
          challenge.mode === "UNSET" && "pointer-events-none opacity-40",
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
            const { key, level } = flattened[virtualItem.index];
            return (
              <li
                key={key}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <TreeNodeLiContent nodeKey={key} level={level} />
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
