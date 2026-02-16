import { capitalizar } from "@/common/utils/string";
import { useAtom, useAtomValue } from "jotai";
import { memo, useMemo } from "react";

import { cn } from "@/common/utils/cn";
import { Badge } from "@/common/components/ui/badge";
import { authStore } from "@/store/auth/atoms";
import { updateUserSpeciesBook } from "@/common/utils/supabase/add_species_book";
import type { NodeEntity } from "@/common/types/tree-atoms";
import { treeAtom } from "@/store/tree";
import {
  getDailySpecies,
  speciesPaths,
} from "@/common/utils/game/daily-species";

import { motion } from "framer-motion";
import { Dna, DnaOff } from "lucide-react";

export const SpecieNode = memo(({ node }: { node: NodeEntity }) => {
  const [userDb, setUserDb] = useAtom(authStore.userDb);

  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challengeInProgress =
    useAtomValue(treeAtom.challenge).status === "IN_PROGRESS";

  const feedback = useMemo<"success" | "error" | null>(() => {
    if (!challengeInProgress) return null;

    const index = expandedNodes.findIndex(
      (n) => n.key === node.key && n.rank === "SPECIES",
    );
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

  const saveSpeciesIfMissing = async () => {
    if (!userDb) return;

    void updateUserSpeciesBook(userDb, (prev) => {
      const alreadyExists = prev.some((item) => item.key === node.key);
      if (alreadyExists) return prev;

      const newItem = {
        key: node.key,
        date: new Date().toISOString(),
        fav: false,
        specie_name: (node.canonicalName || node.scientificName) ?? "",
        family_name: "—", // node?.family
      };

      return [...prev, newItem];
    }).then((updatedUser) => {
      if (updatedUser) setUserDb(updatedUser);
    });
  };

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
            feedback === "success" && "font-bold text-emerald-600",
            feedback === "error" && "text-red-500",
          )}
        >
          {node.canonicalName || node.scientificName}
        </i>

        {feedback === "success" && <Dna className="h-4 w-4 text-emerald-500" />}
        {feedback === "error" && <DnaOff className="h-4 w-4 text-red-500" />}

        <Badge
          className={cn(
            "bg-primary-foreground text-primary rounded-xl px-1 py-0 text-[11px] opacity-0 group-hover:opacity-100",
            feedback && "opacity-100",
          )}
        >
          {capitalizar(node.rank.slice(0, -1))}
        </Badge>
      </div>

      <>&nbsp;</>
    </motion.div>
  );
});
