import { dataFake } from "@/common/utils/dataFake";
import { atom } from "jotai";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";

import { capitalizar } from "@/common/utils/string";

import { atomFamily, atomWithStorage } from "jotai/utils";
import type {
  AnimateState,
  Challenge,
  ExploreInfo,
  NodeEntity,
  PathNode,
} from "@/common/types/tree-atoms";

const challenge = atom<Challenge>({ mode: null, status: "NOT_STARTED" });

const exploreInfos = atom<ExploreInfo[]>(dataFake as ExploreInfo[]);

const animate = atom<AnimateState>({
  isShaking: false,
  shakeDirection: true,
});

const nodesAtom = atom<Record<number, NodeEntity>>({});

const rootKeys = atom<number[]>([]);

const expandedNodes = atomWithStorage<PathNode[]>("tree.expandedPath", []);

const mergeNodes = atom(null, (_, set, nodes: NodeEntity[]) => {
  set(nodesAtom, (prev) => {
    const next = { ...prev };
    nodes.forEach((n) => {
      next[n.key] = { ...next[n.key], ...n };
    });
    return next;
  });
});

export const setExpandedPathAtom = atom(
  null,
  (_get, set, pathNodes: PathNode[]) => {
    set(expandedNodes, pathNodes);
  },
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

    const currentPath = get(expandedNodes);
    const idx = currentPath.findIndex((n) => n.key === key);
    if (idx !== -1) {
      set(expandedNodes, currentPath.slice(0, idx));
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

    set(expandedNodes, pathNodes);
  }
});

export const syncExpandedWithNodesAtom = atom(null, (get, set) => {
  const pathNodes = get(expandedNodes);

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

export const treeAtom = {
  challenge,
  exploreInfos,
  animate,
  expandedNodes,
  nodes: nodesAtom,
  rootKeys,
  mergeNodes,
};
