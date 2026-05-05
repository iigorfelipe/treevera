import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/common/utils/cn";
import { Badge } from "@/common/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

import { capitalizar } from "@/common/utils/string";
import { Dna, Route, DnaOff, Info } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import type { Shortcuts } from "@/common/types/user";
import { updateUserShortcut } from "@/common/utils/supabase/add_shortcut";
import { treeAtom, removeHighlightedKeyAtom } from "@/store/tree";
import { showRankBadgeAtom } from "@/store/user-settings";
import { useTreePanelLayout } from "@/modules/home/tree-panel-layout";
import type { NodeEntity, PathNode } from "@/common/types/tree-atoms";
import { authStore } from "@/store/auth/atoms";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { COLOR_KINGDOM_BY_NAME } from "@/common/constants/tree";
import { invalidateUserPublicProfileQuery } from "@/hooks/queries/cache-invalidation";

export const ContentNode = memo(({ node }: { node: NodeEntity }) => {
  const { i18n, t } = useTranslation();
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const queryClient = useQueryClient();
  const [scientificNameOpen, setScientificNameOpen] = useState(false);
  const showRankBadge = useAtomValue(showRankBadgeAtom);
  const { isCompactMenu } = useTreePanelLayout();
  const store = useStore();

  const isExpanded = node.expanded;
  const taxonRank = node?.kingdom?.toLowerCase() as keyof Shortcuts;

  const challenge = useAtomValue(treeAtom.challenge);
  const challengeInProgress = challenge.status === "IN_PROGRESS";

  const highlightedKeys = useAtomValue(treeAtom.highlightedKeys);
  const isInHighlightedSet =
    highlightedKeys.size > 0 &&
    highlightedKeys.has(node.key) &&
    challengeInProgress;

  const feedbackMap = useAtomValue(treeAtom.challengeFeedbackMap);
  const feedback = feedbackMap.get(node.key) ?? null;

  const removeHighlightedKey = useSetAtom(removeHighlightedKeyAtom);

  useEffect(() => {
    if (isInHighlightedSet && feedback === "error") {
      removeHighlightedKey(node.key);
    }
  }, [isInHighlightedSet, feedback, node.key, removeHighlightedKey]);

  const isHighlighted = isInHighlightedSet && feedback !== "error";

  const hasReachedLimit = useMemo(() => {
    const shortcuts = userDb?.game_info?.shortcuts;
    if (!shortcuts) return false;
    return (shortcuts[taxonRank]?.length ?? 0) >= 3;
  }, [taxonRank, userDb?.game_info?.shortcuts]);

  const saveShortcut = useCallback(async () => {
    if (!userDb || challengeInProgress) return;

    const expandedNodes = store.get(treeAtom.expandedNodes);

    void updateUserShortcut(userDb, (prev) => {
      const currentShortcuts = prev[taxonRank] ?? [];
      if (currentShortcuts.length >= 3) return prev;

      const alreadyExists = currentShortcuts.some(
        (item) =>
          item.nodes.length === expandedNodes.length &&
          item.nodes.every(
            (n, i) =>
              n.key === expandedNodes[i].key &&
              n.rank === expandedNodes[i].rank,
          ),
      );
      if (alreadyExists) return prev;

      const nodePath: PathNode[] = expandedNodes.slice(
        0,
        expandedNodes.findIndex((n) => n.key === node.key) + 1,
      );

      return {
        ...prev,
        [taxonRank]: [
          ...currentShortcuts,
          {
            name: (node.canonicalName || node.scientificName) ?? " - ",
            nodes: nodePath,
          },
        ],
      };
    }).then((updatedUser) => {
      if (updatedUser) {
        setUserDb(updatedUser);
        invalidateUserPublicProfileQuery(queryClient, userDb.username);
      }
    });
  }, [
    userDb,
    challengeInProgress,
    taxonRank,
    store,
    node,
    setUserDb,
    queryClient,
  ]);

  const displayName = node.canonicalName || node.scientificName;
  const showInfoIcon =
    node.scientificName &&
    node.canonicalName &&
    node.scientificName !== node.canonicalName;
  const compactLabel = displayName || capitalizar(node.rank);
  const compactInitial = compactLabel.charAt(0).toUpperCase();
  const compactColor =
    node.color ??
    COLOR_KINGDOM_BY_NAME[
      node.kingdom?.toLowerCase() as keyof typeof COLOR_KINGDOM_BY_NAME
    ];

  if (isCompactMenu) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            key={node.key}
            className={cn(
              "bg-card/90 group flex size-9 cursor-pointer items-center justify-center rounded-xl border shadow-sm transition-all hover:scale-105 hover:shadow-md",
              isExpanded && "bg-accent border-accent-foreground/10",
            )}
            animate={
              feedback === "error"
                ? { x: [0, -4, 4, -2, 2, 0] }
                : isHighlighted || feedback === "success"
                  ? { scale: [1, 1.06, 1] }
                  : { x: 0, scale: 1 }
            }
            transition={{
              duration: feedback === "error" ? 0.3 : 0.5,
              ease: "easeInOut",
            }}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-lg text-[10px] font-semibold text-white transition-transform duration-150 group-hover:scale-110",
                feedback === "success" && "ring-2 ring-emerald-500/50",
                feedback === "error" && "ring-2 ring-red-500/50",
              )}
              style={{ backgroundColor: compactColor }}
            >
              {compactInitial}
            </span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          <div className="font-medium">{compactLabel}</div>
          <div className="opacity-80">{capitalizar(node.rank)}</div>
          {node.numDescendants ? (
            <div className="opacity-80">
              {new Intl.NumberFormat(
                i18n.resolvedLanguage ?? i18n.language,
              ).format(node.numDescendants)}{" "}
              {t("tree.descendants")}
            </div>
          ) : null}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div
      key={node.key}
      className="item group flex h-full w-full flex-row items-center gap-2"
      animate={
        feedback === "error"
          ? { x: [0, -4, 4, -2, 2, 0] }
          : isHighlighted || feedback === "success"
            ? { scale: [1, 1.05, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{
        duration: feedback === "error" ? 0.3 : 0.5,
        ease: "easeInOut",
      }}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="mr-auto flex items-center gap-2">
          <div className="flex flex-col items-start justify-center">
            <span
              className={cn(
                "relative transition-all duration-200 ease-in-out",
                isExpanded && "font-bold",
                feedback === "success" && "text-emerald-600",
                feedback === "error" && "text-red-500",
                isHighlighted && [
                  "z-10",
                  "text-emerald-600",
                  "after:absolute after:-inset-y-0.5",
                  "after:-right-1.5 after:-left-1.5",
                  "after:-z-10 after:rounded-md after:bg-emerald-400/15",
                ],
              )}
            >
              {displayName}
            </span>
          </div>

          {showInfoIcon && (
            <Tooltip
              open={scientificNameOpen}
              onOpenChange={setScientificNameOpen}
            >
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setScientificNameOpen((prev) => !prev);
                  }}
                  className="text-muted-foreground inline-flex items-center"
                >
                  <Info className="size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{node.scientificName}</TooltipContent>
            </Tooltip>
          )}

          {feedback === "success" && (
            <Dna className="h-4 w-4 text-emerald-500" />
          )}
          {feedback === "error" && <DnaOff className="h-4 w-4 text-red-500" />}

          <Badge
            className={cn(
              "bg-primary-foreground text-primary flex items-center gap-1 rounded-xl px-1 py-0 text-[11px] outline-1",
              !showRankBadge && "opacity-0 group-hover:opacity-100",
              !showRankBadge && isExpanded && "opacity-100",
            )}
          >
            {capitalizar(node.rank)}
          </Badge>

          {userDb && isExpanded && !challengeInProgress && (
            <div className="opacity-0 transition-all duration-300 group-hover:opacity-100">
              <Route
                onClick={(e) => {
                  e.stopPropagation();
                  void saveShortcut();
                }}
                className={cn(
                  "size-4 scale-x-[-1]",
                  hasReachedLimit && "opacity-50",
                )}
              />
            </div>
          )}
        </div>

        <span className="text-[11px]">
          {node.numDescendants &&
            new Intl.NumberFormat(
              i18n.resolvedLanguage ?? i18n.language,
            ).format(node.numDescendants)}
        </span>
      </div>
    </motion.div>
  );
});
