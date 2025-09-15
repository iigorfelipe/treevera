import { memo, useMemo } from "react";

import { cn } from "@/common/utils/cn";
import { Badge } from "@/common/components/ui/badge";

import { capitalizar } from "@/common/utils/string";
import { Route } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { authStore } from "@/store/auth";
import type { Shortcuts } from "@/common/types/user";
import { updateUserShortcut } from "@/common/utils/supabase/add_shortcut";
import { treeAtom } from "@/store/tree";
import type { NodeEntity, PathNode } from "@/common/types/tree-atoms";

export const ContentNode = memo(({ node }: { node: NodeEntity }) => {
  const [userDb, setUserDb] = useAtom(authStore.userDb);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  const isExpanded = node.expanded;
  const taxonRank = node?.kingdom?.toLowerCase() as keyof Shortcuts;

  const saveShortcut = async () => {
    if (!userDb) return;

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
    <div className="item group flex h-full w-full flex-row items-center gap-2">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="mr-auto flex items-center gap-2">
          <div className="flex flex-col items-start justify-center">
            <span
              className={cn(
                "transition-transform duration-200 ease-in-out group-hover:scale-105",
                isExpanded && "font-bold",
              )}
            >
              {node.canonicalName || node.scientificName}
            </span>
          </div>

          <Badge
            className={cn(
              "bg-primary-foreground text-primary flex items-center gap-1 rounded-xl px-1 py-[0px] text-[11px] opacity-0 outline-1 group-hover:opacity-100",
              isExpanded && "opacity-100",
            )}
          >
            {capitalizar(node.rank)}
          </Badge>

          {userDb && isExpanded && (
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
    </div>
  );
});
