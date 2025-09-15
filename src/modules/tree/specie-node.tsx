import { capitalizar } from "@/common/utils/string";
import { useAtom, useAtomValue } from "jotai";
import { memo } from "react";

import { cn } from "@/common/utils/cn";
import { Badge } from "@/common/components/ui/badge";
import { authStore } from "@/store/auth";
import { updateUserSpeciesBook } from "@/common/utils/supabase/add_species_book";
import type { NodeEntity } from "@/common/types/tree-atoms";
import { treeAtom } from "@/store/tree";

export const SpecieNode = memo(({ node }: { node: NodeEntity }) => {
  const [userDb, setUserDb] = useAtom(authStore.userDb);

  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  const specieKey = expandedNodes.find((n) => n.rank === "SPECIES")?.key;
  const isSelected = specieKey === node.key;

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
    <div
      className={cn(
        "item flex w-full items-center justify-between transition-colors duration-200",
      )}
      onClick={saveSpeciesIfMissing}
    >
      <div className="flex items-center gap-2">
        <i
          className={cn(
            "w-max transition-transform duration-200 ease-in-out group-hover:scale-105",
            isSelected && "font-bold",
          )}
        >
          {node.canonicalName || node.scientificName}
        </i>

        <Badge
          className={cn(
            "bg-primary-foreground text-primary mr-auto flex items-center gap-1 rounded-xl px-1 py-[0px] text-[11px] opacity-0 outline-1 group-hover:opacity-100",
            isSelected && "font-bold opacity-100",
          )}
        >
          {capitalizar(node.rank.slice(0, -1))}
        </Badge>
      </div>

      <>&nbsp;</>
    </div>
  );
});
