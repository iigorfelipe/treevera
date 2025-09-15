import { useRef } from "react";
import { useAtomValue } from "jotai";

import { treeAtom } from "@/store/tree";
import { TreeNodeLiContent } from "./tree-node";
import { useExpandedSync } from "./hooks/useExpandSync";
import { useVirtualTree } from "./hooks/useVirtualTree";
import { Overlay } from "./overlay";

import "./tree.css";

export const VirtualTree = () => {
  useExpandedSync();

  const parentRef = useRef<HTMLDivElement>(null);
  const nodes = useAtomValue(treeAtom.nodes);
  const roots = useAtomValue(treeAtom.rootKeys);

  const { flattened, rowVirtualizer, connectors } = useVirtualTree(
    nodes,
    roots,
    parentRef,
  );

  return (
    <div
      ref={parentRef}
      className="h-dvh w-full overflow-auto px-4 py-28"
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
  );
};
