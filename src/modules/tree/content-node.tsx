import { memo, useMemo } from "react";

import { cn } from "@/common/utils/cn";
import { Badge } from "@/common/components/ui/badge";

import { capitalizar } from "@/common/utils/string";
import { Dna, Route, DnaOff } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { authStore } from "@/store/auth";
import type { Shortcuts } from "@/common/types/user";
import { updateUserShortcut } from "@/common/utils/supabase/add_shortcut";
import { treeAtom } from "@/store/tree";
import type { NodeEntity, PathNode } from "@/common/types/tree-atoms";
import {
  getDailySpecies,
  speciesPaths,
} from "@/common/utils/game/daily-species";
import { motion } from "framer-motion";

export const ContentNode = memo(({ node }: { node: NodeEntity }) => {
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  const isExpanded = node.expanded;
  const taxonRank = node?.kingdom?.toLowerCase() as keyof Shortcuts;

  const challengeInProgress =
    useAtomValue(treeAtom.challenge).status === "IN_PROGRESS";

  const highlightedRank = useAtomValue(treeAtom.highlightedRank);

  const isHighlighted = highlightedRank === node.rank && challengeInProgress;

  const feedback = useMemo<"success" | "error" | null>(() => {
    if (!challengeInProgress) return null;

    const index = expandedNodes.findIndex((n) => n.key === node.key);
    if (index === -1) return null;

    const speciesName = getDailySpecies();
    const correctPath = speciesPaths[speciesName] || [];
    const expected = correctPath[index];

    if (!expected) return null;

    return node.canonicalName === expected.name ||
      node.scientificName === expected.name
      ? "success"
      : "error";
  }, [expandedNodes, node, challengeInProgress]);

  const saveShortcut = async () => {
    if (!userDb) return;
    if (challengeInProgress) return;

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

      const newShortcutItem: Shortcuts["animalia"][0] = {
        name: (node.canonicalName || node.scientificName) ?? " - ",
        nodes: nodePath,
      };

      return {
        ...prev,
        [taxonRank]: [...currentShortcuts, newShortcutItem],
      };
    }).then((updatedUser) => {
      if (updatedUser) setUserDb(updatedUser);
    });
  };

  const hasReachedLimit = useMemo(() => {
    const shortcuts = userDb?.game_info?.shortcuts;
    if (!shortcuts) return false;
    if (shortcuts[taxonRank]?.length >= 3) return true;
    return false;
  }, [taxonRank, userDb?.game_info?.shortcuts]);

  return (
    <motion.div
      key={`${node.key}-${feedback}`}
      className="item group flex h-full w-full flex-row items-center gap-2"
      animate={
        isHighlighted
          ? { scale: [1, 1.03, 1] }
          : feedback === "success"
            ? { scale: [1, 1.05, 1] }
            : feedback === "error"
              ? { x: [-4, 4, -2, 2, 0] }
              : {}
      }
      transition={{ duration: 0.5 }}
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
              {node.canonicalName || node.scientificName}
            </span>
          </div>

          {feedback === "success" && (
            <Dna className="h-4 w-4 text-emerald-500" />
          )}
          {feedback === "error" && <DnaOff className="h-4 w-4 text-red-500" />}

          <Badge
            className={cn(
              "bg-primary-foreground text-primary flex items-center gap-1 rounded-xl px-1 py-0 text-[11px] opacity-0 outline-1 group-hover:opacity-100",
              isExpanded && "opacity-100",
            )}
          >
            {capitalizar(node.rank)}
          </Badge>

          {userDb && isExpanded && !challengeInProgress && (
            <div className="opacity-0 transition-all duration-300 group-hover:opacity-100">
              <Route
                onClick={saveShortcut}
                className={cn(
                  "size-4 scale-x-[-1]",
                  hasReachedLimit && "opacity-50",
                )}
              />
            </div>
          )}
        </div>

        <span className="text-[11px]">
          {node.numDescendants && node.numDescendants.toLocaleString("pt-BR")}
        </span>
      </div>
    </motion.div>
  );
});
