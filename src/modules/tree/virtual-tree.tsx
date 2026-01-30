import { useRef } from "react";
import { useAtomValue } from "jotai";

import { treeAtom } from "@/store/tree";
import { TreeNodeLiContent } from "./tree-node";
import { useExpandedSync } from "./hooks/useExpandSync";
import { useVirtualTree } from "./hooks/useVirtualTree";
import { Overlay } from "./overlay";
import { Search } from "./search";

import "./tree.css";
import { getDailySpecies } from "@/common/utils/game/daily-species";

export const VirtualTree = () => {
  useExpandedSync();

  const parentRef = useRef<HTMLDivElement>(null);
  const nodes = useAtomValue(treeAtom.nodes);
  const roots = useAtomValue(treeAtom.rootKeys);
  const challengeStarted =
    useAtomValue(treeAtom.challenge).status === "IN_PROGRESS";
  const speciesName = getDailySpecies();

  const { flattened, rowVirtualizer, connectors } = useVirtualTree(
    nodes,
    roots,
    parentRef,
  );

  return (
    <>
      <div className="mt-28 mb-4 px-4">
        {challengeStarted ? (
          <p className="text-lg leading-relaxed font-medium text-gray-700">
            Expanda os nós até encontrar a espécie{" "}
            <i className="font-semibold tracking-wide text-emerald-600 dark:text-green-500">
              {speciesName}
            </i>
          </p>
        ) : (
          <Search />
        )}
      </div>

      <div
        ref={parentRef}
        className="h-[calc(100dvh-230px)] w-full overflow-auto px-4 pb-28"
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
