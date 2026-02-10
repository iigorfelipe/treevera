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
import type { Rank } from "@/common/types/api";

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
  const allNodes = get(nodesAtom);
  const targetNode = allNodes[key];

  if (!targetNode) return;

  const expandedPath = get(expandedNodes);
  const pathIndex = expandedPath.findIndex((n) => n.key === key);

  if (pathIndex !== -1) {
    set(expandedNodes, expandedPath.slice(0, pathIndex));
    return;
  }

  const ancestorPath: NodeEntity[] = [];
  let currentNode: NodeEntity | undefined = targetNode;

  while (currentNode) {
    ancestorPath.unshift(currentNode);
    currentNode = currentNode.parentKey
      ? allNodes[currentNode.parentKey]
      : undefined;
  }

  const newPathNodes: PathNode[] = ancestorPath.map((node) => ({
    key: node.key,
    rank: node.rank,
    name:
      node.rank === "KINGDOM"
        ? capitalizar(NAME_KINGDOM_BY_KEY[node.key])
        : node.canonicalName || node.scientificName || "",
  }));

  set(expandedNodes, newPathNodes);
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
      const shouldExpand = path.rank !== "SPECIES";
      if (next[path.key]) {
        next[path.key] = { ...next[path.key], expanded: shouldExpand };
      } else {
        next[path.key] = { ...path, numDescendants: 0, expanded: shouldExpand };
      }
    }

    return next;
  });
});

const highlightedRank = atom<Rank | null>(null);

export const setHighlightedRankAtom = atom(
  null,
  (_get, set, rank: Rank | null) => {
    set(highlightedRank, rank);
  },
);

const scrollToRank = atom<Rank | null>(null);

export const scrollToRankAtom = atom(null, (_get, set, rank: Rank | null) => {
  set(scrollToRank, rank);
});

export const treeAtom = {
  challenge,
  exploreInfos,
  animate,
  expandedNodes,
  highlightedRank,
  scrollToRank,
  nodes: nodesAtom,
  rootKeys,
  mergeNodes,
};
