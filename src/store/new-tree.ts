import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import type { Rank } from "@/common/types/api";
import { capitalizar } from "@/common/utils/string";

import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";

export type PathNode = {
  rank: Rank;
  key: number;
  name: string;
};

export type NodeEntity = {
  key: number;
  rank: Rank;
  color?: string;
  numDescendants: number;
  canonicalName?: string;
  scientificName?: string;
  kingdom?: string;
  childrenKeys?: number[];
  expanded?: boolean;
  parentKey?: number;
};

export const nodesAtom = atom<Record<number, NodeEntity>>({});

export const rootKeysAtom = atom<number[]>([]);

export const expandedNodesAtom = atomWithStorage<PathNode[]>(
  "tree.expandedPath",
  [],
);

export const nodeAtomFamily = atomFamily((key: number) =>
  atom(
    (get) => get(nodesAtom)[key],

    (
      _get,
      set,
      updater: Partial<NodeEntity> | ((prev?: NodeEntity) => NodeEntity),
    ) => {
      set(nodesAtom, (prev) => {
        const prevNode = prev[key];
        const nextNode =
          typeof updater === "function"
            ? updater(prevNode)
            : { ...prevNode, ...updater };
        return { ...prev, [key]: nextNode };
      });
    },
  ),
);

export const mergeNodesAtom = atom(null, (_, set, nodes: NodeEntity[]) => {
  set(nodesAtom, (prev) => {
    const next = { ...prev };
    nodes.forEach((n) => {
      next[n.key] = { ...next[n.key], ...n };
    });
    return next;
  });
});

export const setNodeChildrenAtom = atom(
  null,
  (_, set, payload: { key: number; children: NodeEntity[] }) => {
    const { key, children } = payload;
    set(nodesAtom, (prev) => {
      const next = { ...prev };

      children.forEach((c) => {
        next[c.key] = { ...(next[c.key] ?? {}), ...c, parentKey: key };
      });

      next[key] = {
        ...(next[key] ?? {}),
        childrenKeys: children.map((c) => c.key),
      };

      return next;
    });
  },
);

export const toggleNodeAtom = atom(null, (get, set, key: number) => {
  const nodes = get(nodesAtom);
  const node = nodes[key];
  if (!node) return;

  if (node.expanded) {
    set(nodesAtom, (prev) => ({
      ...prev,
      [key]: { ...prev[key], expanded: false },
    }));

    const currentPath = get(expandedNodesAtom);
    const idx = currentPath.findIndex((n) => n.key === key);
    if (idx !== -1) {
      set(expandedNodesAtom, currentPath.slice(0, idx));
    }
  } else {
    const path: NodeEntity[] = [];
    let current: NodeEntity | undefined = node;

    while (current) {
      path.unshift(current);
      current = current.parentKey ? nodes[current.parentKey] : undefined;
    }

    set(nodesAtom, (prev) => {
      const next: Record<number, NodeEntity> = {};

      for (const k in prev) {
        next[+k] = { ...prev[+k], expanded: false };
      }

      for (const n of path) {
        next[n.key] = { ...next[n.key], expanded: true };
      }

      return next;
    });

    const pathNodes: PathNode[] = path.map((n) => ({
      key: n.key,
      rank: n.rank,
      name:
        n.rank === "KINGDOM"
          ? capitalizar(NAME_KINGDOM_BY_KEY[n.key])
          : n.canonicalName || n.scientificName || "",
    }));

    set(expandedNodesAtom, pathNodes);
  }
});

export const setExpandedPathAtom = atom(
  null,
  (_get, set, pathNodes: PathNode[]) => {
    set(expandedNodesAtom, pathNodes);
  },
);

export const syncExpandedWithNodesAtom = atom(null, (get, set) => {
  const pathNodes = get(expandedNodesAtom);

  set(nodesAtom, (prev) => {
    const next = { ...prev };

    for (const key in next) {
      if (next[key].expanded) {
        next[key] = { ...next[key], expanded: false };
      }
    }

    for (const path of pathNodes) {
      if (next[path.key]) {
        next[path.key] = { ...next[path.key], expanded: true };
      } else {
        next[path.key] = { ...path, numDescendants: 0, expanded: true };
      }
    }

    return next;
  });
});
