import { capitalizar } from "@/common/utils/string";
import { useAtomValue, useStore } from "jotai";
import { memo, useMemo, useState } from "react";

import { cn } from "@/common/utils/cn";
import { Badge } from "@/common/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { authStore } from "@/store/auth/atoms";
import { addSeenSpecie } from "@/common/utils/supabase/user-seen-species";
import type { NodeEntity } from "@/common/types/tree-atoms";
import { treeAtom } from "@/store/tree";
import { useTreePanelLayout } from "@/modules/home/tree-panel-layout";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useCheckAchievements } from "@/hooks/mutations/useCheckAchievements";

import { Dna, DnaOff, Info } from "lucide-react";
import { motion } from "framer-motion";
import { COLOR_KINGDOM_BY_NAME } from "@/common/constants/tree";

export const SpecieNode = memo(({ node }: { node: NodeEntity }) => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;
  const [scientificNameOpen, setScientificNameOpen] = useState(false);
  const queryClient = useQueryClient();
  const store = useStore();
  const { isCompactMenu } = useTreePanelLayout();

  const checkAchievements = useCheckAchievements();
  const challenge = useAtomValue(treeAtom.challenge);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challengeActive =
    challenge.status === "IN_PROGRESS" || challenge.status === "COMPLETED";
  const speciesKey = challenge.speciesKey;

  const feedbackMap = useAtomValue(treeAtom.challengeFeedbackMap);
  const isInPath = feedbackMap.has(node.key);

  const feedback = useMemo<"success" | "error" | null>(() => {
    if (!challengeActive || !isInPath) return null;
    return node.key === speciesKey ? "success" : "error";
  }, [challengeActive, isInPath, node.key, speciesKey]);

  const isSelected =
    isInPath ||
    expandedNodes.some((expandedNode) => expandedNode.key === node.key);

  const saveSpeciesIfMissing = async () => {
    if (!userId) return;
    if (challenge.status === "IN_PROGRESS") return;

    const expandedPath = store.get(treeAtom.expandedNodes);
    const familyName =
      (node as unknown as { family?: string }).family ??
      expandedPath.find((n) => n.rank === "FAMILY")?.name;

    await addSeenSpecie(
      userId,
      node.key,
      node.kingdom,
      node.canonicalName || node.scientificName,
      familyName,
    );
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_seen_species_key, userId],
    });
    void checkAchievements();
  };

  const displayName =
    node.canonicalName || node.scientificName || capitalizar(node.rank);
  const showInfoIcon =
    node.scientificName &&
    node.canonicalName &&
    node.scientificName !== node.canonicalName;
  const compactInitial = displayName.charAt(0).toUpperCase();
  const compactColor =
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
              isSelected && "bg-accent border-accent-foreground/10",
            )}
            animate={
              feedback === "error"
                ? { x: [0, -4, 4, -2, 2, 0] }
                : feedback === "success"
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
          <div className="font-medium italic">{displayName}</div>
          <div className="opacity-80">{capitalizar(node.rank)}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div
      key={node.key}
      className={cn(
        "item group flex w-full items-center justify-between",
        isSelected && "item-active",
      )}
      animate={
        feedback === "error"
          ? { x: [0, -4, 4, -2, 2, 0] }
          : feedback === "success"
            ? { scale: [1, 1.05, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{
        duration: feedback === "error" ? 0.3 : 0.5,
        ease: "easeInOut",
      }}
      onClick={saveSpeciesIfMissing}
    >
      <div className="flex items-center gap-2">
        <i
          className={cn(
            "w-max transition-all duration-200 ease-in-out",
            isSelected && "font-bold",
            feedback === "success" && "text-emerald-600",
            feedback === "error" && "text-red-500",
          )}
        >
          {displayName}
        </i>

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

        {feedback === "success" && <Dna className="h-4 w-4 text-emerald-500" />}
        {feedback === "error" && <DnaOff className="h-4 w-4 text-red-500" />}

        <Badge
          className={cn(
            "bg-primary-foreground text-primary rounded-xl px-1 py-0 text-[11px] opacity-0 group-hover:opacity-100",
            isSelected && "opacity-100",
            feedback && "opacity-100",
          )}
        >
          {capitalizar(node.rank)}
        </Badge>
      </div>

      <>&nbsp;</>
    </motion.div>
  );
});
