import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import {
  treeAtom,
  shortcutScrollTargetAtom,
  setExpandedPathAtom,
} from "@/store/tree";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import type { PathNode } from "@/common/types/tree-atoms";

export function useTreeNavigation() {
  const navigate = useNavigate();
  const allNodes = useAtomValue(treeAtom.nodes);
  const expandedPath = useAtomValue(treeAtom.expandedNodes);
  const setShortcutTarget = useSetAtom(shortcutScrollTargetAtom);
  const setExpandedPath = useSetAtom(setExpandedPathAtom);
  const challenge = useAtomValue(treeAtom.challenge);
  const isInChallenge = challenge.status === "IN_PROGRESS";

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
    (nodes: PathNode[], fromShortcut = false) => {
      setShortcutTarget(fromShortcut ? [...nodes] : null);
      const path = nodesToPath(nodes);
      navigate({ to: path });
    },
    [navigate, nodesToPath, setShortcutTarget],
  );

  const toggleNode = useCallback(
    (key: number) => {
      const targetNode = allNodes[key];
      if (!targetNode) return;

      const idx = expandedPath.findIndex((n) => n.key === key);
      if (idx !== -1) {
        if (isInChallenge) {
          setExpandedPath(expandedPath.slice(0, idx));
        } else {
          navigateToNodes(expandedPath.slice(0, idx));
        }
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

      if (isInChallenge) {
        setExpandedPath(ancestors);
      } else {
        navigateToNodes(ancestors);
      }
    },
    [allNodes, expandedPath, navigateToNodes, isInChallenge, setExpandedPath],
  );

  return { navigateToNodes, toggleNode, nodesToPath };
}
