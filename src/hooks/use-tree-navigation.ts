import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import {
  selectedSpecieKeyAtom,
  treeAtom,
  shortcutScrollTargetAtom,
} from "@/store/tree";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import type { PathNode } from "@/common/types/tree-atoms";
import { useTreePanelLayout } from "@/modules/home/tree-panel-layout";

type NavigateToNodesOptions = {
  preferMobileTreeView?: boolean;
};

export function useTreeNavigation() {
  const navigate = useNavigate();
  const store = useStore();
  const setShortcutTarget = useSetAtom(shortcutScrollTargetAtom);
  const challenge = useAtomValue(treeAtom.challenge);
  const { requestPanelExpand } = useTreePanelLayout();

  const nodesToPath = useCallback(
    (nodes: PathNode[]) => {
      const base =
        challenge.mode === "DAILY"
          ? "/challenges/daily"
          : challenge.mode === "RANDOM"
            ? "/challenges/random"
            : "/tree";

      if (nodes.length === 0)
        return challenge.mode === "DAILY" || challenge.mode === "RANDOM"
          ? base
          : "/";
      return `${base}/${nodes.map((n) => n.key).join("/")}`;
    },
    [challenge.mode],
  );

  const navigateToNodes = useCallback(
    (
      nodes: PathNode[],
      fromShortcut = false,
      options: NavigateToNodesOptions = {},
    ) => {
      requestPanelExpand();
      setShortcutTarget(fromShortcut ? [...nodes] : null);
      store.set(
        treeAtom.mobileTreeView,
        options.preferMobileTreeView ?? false,
      );
      const path = nodesToPath(nodes);
      navigate({ to: path, resetScroll: false });
    },
    [navigate, nodesToPath, requestPanelExpand, setShortcutTarget, store],
  );

  const toggleNode = useCallback(
    (key: number) => {
      const allNodes = store.get(treeAtom.nodes);
      const expandedPath = store.get(treeAtom.expandedNodes);
      const listTreeMode = store.get(treeAtom.listTreeMode);

      const targetNode = allNodes[key];
      if (!targetNode) return;

      const idx = expandedPath.findIndex((n) => n.key === key);
      if (!listTreeMode && idx !== -1) {
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

      if (listTreeMode) {
        if (targetNode.rank !== "SPECIES") {
          const selectedNode = ancestors[ancestors.length - 1];

          store.set(treeAtom.expandedNodes, ancestors);
          store.set(selectedSpecieKeyAtom, null);
          store.set(treeAtom.listTreeGroupFilter, {
            rank: selectedNode.rank,
            key: selectedNode.key,
            name: selectedNode.name,
          });
          store.set(treeAtom.mobileListTreeView, "content");
          return;
        }

        store.set(treeAtom.listTreeGroupFilter, null);
        store.set(treeAtom.expandedNodes, ancestors);
        store.set(selectedSpecieKeyAtom, key);
        store.set(treeAtom.mobileListTreeView, "content");
        return;
      }

      navigateToNodes(ancestors);
    },
    [store, navigateToNodes],
  );

  return { navigateToNodes, toggleNode, nodesToPath };
}
