import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { treeAtom } from "@/store/tree";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import type { PathNode } from "@/common/types/tree-atoms";

export function useTreeNavigation() {
  const navigate = useNavigate();
  const allNodes = useAtomValue(treeAtom.nodes);
  const expandedPath = useAtomValue(treeAtom.expandedNodes);

  const nodesToPath = useCallback((nodes: PathNode[]) => {
    if (nodes.length === 0) return "/";
    return `/tree/${nodes.map((n) => n.key).join("/")}`;
  }, []);

  const navigateToNodes = useCallback(
    (nodes: PathNode[]) => {
      const path = nodesToPath(nodes);
      console.log("🧭 Navegando para:", path);
      navigate({ to: path });
    },
    [navigate, nodesToPath],
  );

  const toggleNode = useCallback(
    (key: number) => {
      const targetNode = allNodes[key];
      if (!targetNode) return;

      const idx = expandedPath.findIndex((n) => n.key === key);
      if (idx !== -1) {
        navigateToNodes(expandedPath.slice(0, idx));
        return;
      }

      const ancestors: PathNode[] = [];
      let cur = targetNode;
      while (cur) {
        ancestors.unshift({
          key: cur.key,
          rank: cur.rank,
          name:
            cur.rank === "KINGDOM"
              ? capitalizar(NAME_KINGDOM_BY_KEY[cur.key])
              : cur.canonicalName || cur.scientificName || "",
        });
        cur = cur.parentKey ? allNodes[cur.parentKey] : undefined!;
      }

      navigateToNodes(ancestors);
    },
    [allNodes, expandedPath, navigateToNodes],
  );

  return { navigateToNodes, toggleNode, nodesToPath };
}
