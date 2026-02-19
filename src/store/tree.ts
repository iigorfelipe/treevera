import { dataFake } from "@/common/utils/dataFake";
import { atom } from "jotai";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";

import { capitalizar } from "@/common/utils/string";

import { atomFamily } from "jotai/utils";
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

const expandedNodes = atom<PathNode[]>([]);

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

let prevExpandedKeys = new Set<number>();

export const syncExpandedWithNodesAtom = atom(null, (get, set) => {
  const pathNodes = get(expandedNodes);

  const nextExpandedKeys = new Set(
    pathNodes.filter((p) => p.rank !== "SPECIES").map((p) => p.key),
  );

  if (
    nextExpandedKeys.size === prevExpandedKeys.size &&
    [...nextExpandedKeys].every((k) => prevExpandedKeys.has(k))
  ) {
    return;
  }

  const toCollapse = [...prevExpandedKeys].filter(
    (k) => !nextExpandedKeys.has(k),
  );
  const toExpand = [...nextExpandedKeys].filter(
    (k) => !prevExpandedKeys.has(k),
  );

  prevExpandedKeys = nextExpandedKeys;

  set(nodesAtom, (prev) => {
    if (toCollapse.length === 0 && toExpand.length === 0) return prev;

    const next = { ...prev };

    for (const key of toCollapse) {
      if (next[key]) next[key] = { ...next[key], expanded: false };
    }

    for (const key of toExpand) {
      const path = pathNodes.find((p) => p.key === key);
      if (next[key]) {
        next[key] = { ...next[key], expanded: true };
      } else if (path) {
        next[key] = { ...path, numDescendants: 0, expanded: true };
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

const playedStepAudioAtom = atom<Record<string, true>>({});

export const selectedSpecieKeyAtom = atom<number | null>(null);

export const treeAtom = {
  challenge,
  exploreInfos,
  animate,
  expandedNodes,
  highlightedRank,
  scrollToRank,
  feedbackAudio: playedStepAudioAtom,
  nodes: nodesAtom,
  rootKeys,
  mergeNodes,
};
