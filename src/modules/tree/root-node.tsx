import { getRankIcon } from "@/common/utils/tree/ranks";

import { useAtomValue } from "jotai";
import { memo } from "react";

import { formatNumber } from "@/common/utils/format";
import { cn } from "@/common/utils/cn";
import { treeAtom } from "@/store/tree";
import { Image } from "@/common/components/image";
import {
  BORDER_KINGDOM_BY_KEY,
  NAME_KINGDOM_BY_KEY,
} from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import type { NodeEntity } from "@/common/types/tree-atoms";

export const RootNode = memo(
  ({ node, isLoading }: { node: NodeEntity; isLoading: boolean }) => {
    const { isShaking, shakeDirection } = useAtomValue(treeAtom.animate);

    const isExpanded = node.expanded;

    const isLoadingNode = isLoading && isExpanded;

    return (
      <div
        className={cn(
          "group flex h-full w-full min-w-2xs cursor-pointer items-center gap-4 rounded-lg px-2",
          isExpanded &&
            `rounded-bl-none border-2 ${BORDER_KINGDOM_BY_KEY[node.key]}`,
          !isExpanded && "hover:bg-accent",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-xl",
            !isExpanded && "group-hover:bg-accent bg-accent",
          )}
        >
          <div className="flex size-11 items-center justify-center overflow-hidden rounded-lg p-3">
            <Image
              src={getRankIcon(node.key)}
              alt={NAME_KINGDOM_BY_KEY[node.key]}
              className={cn(
                "h-full w-full transition-transform duration-150 group-hover:scale-150",
                isLoadingNode
                  ? "animate-wiggle"
                  : isShaking
                    ? shakeDirection
                      ? "rotate-6"
                      : "-rotate-6"
                    : "rotate-0",
                isShaking ? "" : "group-hover:rotate-6",
                isExpanded && "scale-150",
              )}
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-1">
          <div className="flex flex-col">
            <h1
              className={cn("text-md font-medium", isExpanded && "font-bold")}
            >
              {capitalizar(NAME_KINGDOM_BY_KEY[node.key])}
            </h1>
            <span className="text-xs">
              {formatNumber(node.numDescendants)} <span>descendentes</span>
            </span>
          </div>
        </div>
      </div>
    );
  },
);
