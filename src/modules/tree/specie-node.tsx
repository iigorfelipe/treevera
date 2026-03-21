import { capitalizar } from "@/common/utils/string";
import { useAtomValue } from "jotai";
import { memo, useMemo, useCallback, useState } from "react";

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
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useCheckAchievements } from "@/hooks/mutations/useCheckAchievements";

import { motion } from "framer-motion";
import { Dna, DnaOff, Info } from "lucide-react";

export const SpecieNode = memo(({ node }: { node: NodeEntity }) => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;
  const [scientificNameOpen, setScientificNameOpen] = useState(false);
  const queryClient = useQueryClient();

  const checkAchievements = useCheckAchievements();
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const challengeInProgress = challenge.status === "IN_PROGRESS";
  const challengeActive = challengeInProgress || challenge.status === "COMPLETED";
  const speciesKey = challenge.speciesKey;

  const isSelected = useMemo(
    () => expandedNodes.some((n) => n.key === node.key),
    [expandedNodes, node.key],
  );

  const feedback = useMemo<"success" | "error" | null>(() => {
    if (!challengeActive || !isSelected) return null;
    return node.key === speciesKey ? "success" : "error";
  }, [challengeActive, isSelected, node.key, speciesKey]);

  const familyName =
    (node as unknown as { family?: string }).family ??
    expandedNodes.find((n) => n.rank === "FAMILY")?.name;

  const saveSpeciesIfMissing = useCallback(async () => {
    if (!userId) return;

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
  }, [userId, node.key, node.kingdom, node.canonicalName, node.scientificName, familyName, queryClient, checkAchievements]);

  const displayName = node.canonicalName || node.scientificName;
  const showInfoIcon =
    node.scientificName &&
    node.canonicalName &&
    node.scientificName !== node.canonicalName;

  return (
    <motion.div
      key={`${node.key}-${feedback}`}
      className="item flex w-full items-center justify-between"
      animate={
        feedback === "success"
          ? { scale: [1, 1.08, 1] }
          : feedback === "error"
            ? { x: [-4, 4, -2, 2, 0] }
            : {}
      }
      transition={{ duration: 0.3 }}
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
