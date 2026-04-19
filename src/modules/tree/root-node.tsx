import { getRankIcon } from "@/common/utils/tree/ranks";

import { useAtomValue } from "jotai";
import { memo } from "react";

import { formatNumber } from "@/common/utils/format";
import { cn } from "@/common/utils/cn";
import { treeAtom } from "@/store/tree";
import { Image } from "@/common/components/image";
import { useTreePanelLayout } from "@/modules/home/tree-panel-layout";
import {
  BORDER_KINGDOM_BY_KEY,
  NAME_KINGDOM_BY_KEY,
} from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import type { NodeEntity } from "@/common/types/tree-atoms";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

export const RootNode = memo(
  ({ node, isLoading }: { node: NodeEntity; isLoading: boolean }) => {
    const { t } = useTranslation();
    const { isShaking, shakeDirection } = useAtomValue(treeAtom.animate);
    const { isCompactMenu } = useTreePanelLayout();

    const isExpanded = node.expanded;

    const isLoadingNode = isLoading && isExpanded;
    const kingdomName = capitalizar(NAME_KINGDOM_BY_KEY[node.key]);

    if (isCompactMenu) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "bg-card/90 group flex size-10 cursor-pointer items-center justify-center rounded-xl border shadow-sm transition-all hover:scale-105 hover:shadow-md",
                isExpanded && BORDER_KINGDOM_BY_KEY[node.key],
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-lg">
                <Image
                  src={getRankIcon(node.key)}
                  alt={NAME_KINGDOM_BY_KEY[node.key]}
                  className={cn(
                    "size-5 transition-transform duration-150 group-hover:scale-110",
                    isLoadingNode
                      ? "animate-wiggle"
                      : isShaking
                        ? shakeDirection
                          ? "rotate-6"
                          : "-rotate-6"
                        : "rotate-0",
                    isShaking ? "" : "group-hover:rotate-6",
                    isExpanded && "scale-110",
                  )}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <div className="font-medium">{kingdomName}</div>
            <div className="opacity-80">
              {formatNumber(node.numDescendants)} {t("tree.descendants")}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

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
              {kingdomName}
            </h1>
            <span className="text-xs">
              {formatNumber(node.numDescendants)}{" "}
              <span>{t("tree.descendants")}</span>
            </span>
          </div>
        </div>
      </div>
    );
  },
);
