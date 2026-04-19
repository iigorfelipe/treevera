import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";

import { treeAtom } from "@/store/tree";
import { TreeNodeLiContent } from "./tree-node";
import { EmptyNodeInfoCard } from "./empty-node-info";
import { SearchBannerNode } from "./search-banner-node";
import { useExpandedSync } from "./hooks/useExpandSync";
import { useVirtualTree } from "./hooks/useVirtualTree";
import { Overlay } from "./overlay";
import { Search } from "./search/index";

import "./tree.css";
import { useResponsive } from "@/hooks/use-responsive";
import { cn } from "@/common/utils/cn";
import type { Rank } from "@/common/types/api";
import { useChallengeAudio } from "./hooks/use-challenge-audio";
import { useShortcutScroll } from "./hooks/use-shortcut-scroll";
import { usePrefetchExpandedChildren } from "./hooks/usePrefetchExpandedChildren";
import { Challenges } from "@/app/challenges";
import { useTreePanelLayout } from "@/modules/home/tree-panel-layout";
import {
  COLOR_KINGDOM_BY_NAME,
  TREE_CONNECTOR_HORIZONTAL_LENGTH_PX,
  TREE_CONNECTOR_LINE_WIDTH_PX,
  TREE_LEVEL_INDENT_PX,
  TREE_TOGGLE_BUTTON_DIAMETER_PX,
  TREE_TOGGLE_BUTTON_OFFSET_X_PX,
} from "@/common/constants/tree";

const TIPS_OPEN_TREE_PUSH_PX = 80;
const CONNECTOR_HALF_THICKNESS = Math.floor(TREE_CONNECTOR_LINE_WIDTH_PX / 2);
const NON_KINGDOM_ROW_HEIGHT = 34;

export const VirtualTree = () => {
  useExpandedSync();
  useChallengeAudio();
  usePrefetchExpandedChildren();

  const parentRef = useRef<HTMLDivElement>(null);
  const nodes = useAtomValue(treeAtom.nodes);
  const roots = useAtomValue(treeAtom.rootKeys);
  const challengeMode = useAtomValue(treeAtom.challenge).mode;
  const tipsOpen = useAtomValue(treeAtom.challengeTipsOpen);
  const scrollToRank = useAtomValue(treeAtom.scrollToRank);
  const lastScrolledRank = useRef<Rank | null>(null);
  const scrollToNodeKey = useAtomValue(treeAtom.scrollToNodeKey);
  const lastScrolledNodeKey = useRef<number | null>(null);
  const { isCompactMenu } = useTreePanelLayout();

  const { isTablet } = useResponsive();

  const { flattened, rowVirtualizer, connectors } = useVirtualTree(
    nodes,
    roots,
    parentRef,
    isCompactMenu,
  );

  useEffect(() => {
    if (!scrollToRank) {
      lastScrolledRank.current = null;
      return;
    }

    if (scrollToRank === lastScrolledRank.current) return;

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

  useEffect(() => {
    if (!scrollToNodeKey) {
      lastScrolledNodeKey.current = null;
      return;
    }

    if (scrollToNodeKey === lastScrolledNodeKey.current) return;

    lastScrolledNodeKey.current = scrollToNodeKey;

    const targetIndex = flattened.findIndex(
      (item) => item.key === scrollToNodeKey,
    );

    if (targetIndex === -1) return;

    rowVirtualizer.scrollToIndex(targetIndex, {
      align: "center",
      behavior: "smooth",
    });
  }, [scrollToNodeKey, flattened, rowVirtualizer]);

  useShortcutScroll(flattened, rowVirtualizer);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isCompactMenu && (
        <div className="mb-4 px-4 pt-2">
          {challengeMode && isTablet && <Challenges />}

          {!challengeMode && <Search />}
        </div>
      )}

      <div
        ref={parentRef}
        className={cn(
          "w-full overflow-x-hidden overflow-y-auto transition-[padding-top,padding] duration-200",
          isCompactMenu
            ? "h-[calc(100dvh-96px)] px-2 pr-1 pb-4"
            : "h-[calc(100dvh-144px)] px-4 pb-28",
          challengeMode === "UNSET" && "pointer-events-none opacity-40",
        )}
        style={{
          WebkitOverflowScrolling: "touch",
          paddingTop:
            isTablet && challengeMode && tipsOpen
              ? TIPS_OPEN_TREE_PUSH_PX
              : undefined,
        }}
      >
        <ul
          style={{ height: rowVirtualizer.getTotalSize() }}
          className="relative w-full"
        >
          {!isCompactMenu && (
            <Overlay
              connectors={connectors}
              totalHeight={rowVirtualizer.getTotalSize()}
            />
          )}

          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = flattened[virtualItem.index];
            const isRealNode =
              !item.isSearchBanner && !item.isEmptyInfo && item.key > 0;
            const node = isRealNode ? nodes[item.key] : undefined;

            const showHConnector =
              isRealNode && node?.rank !== "KINGDOM" && item.level > 0;
            const hConnectorLeft = showHConnector
              ? Math.round(
                  item.level * TREE_LEVEL_INDENT_PX +
                    TREE_TOGGLE_BUTTON_OFFSET_X_PX +
                    TREE_TOGGLE_BUTTON_DIAMETER_PX / 2 -
                    TREE_CONNECTOR_HORIZONTAL_LENGTH_PX -
                    CONNECTOR_HALF_THICKNESS,
                )
              : 0;
            const hConnectorColor = showHConnector
              ? (COLOR_KINGDOM_BY_NAME[
                  node!.kingdom?.toLocaleLowerCase() as keyof typeof COLOR_KINGDOM_BY_NAME
                ] ?? "transparent")
              : "transparent";

            return (
              <li
                key={item.key}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: virtualItem.size,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {showHConnector && !isCompactMenu && (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: hConnectorLeft,
                      top:
                        NON_KINGDOM_ROW_HEIGHT / 2 - CONNECTOR_HALF_THICKNESS,
                      width:
                        TREE_CONNECTOR_HORIZONTAL_LENGTH_PX +
                        CONNECTOR_HALF_THICKNESS,
                      height: TREE_CONNECTOR_LINE_WIDTH_PX,
                      backgroundColor: hConnectorColor,
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />
                )}

                {item.isSearchBanner ? (
                  <SearchBannerNode
                    parentNodeKey={item.parentNodeKey!}
                    level={item.level}
                  />
                ) : item.isEmptyInfo ? (
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
    </div>
  );
};
