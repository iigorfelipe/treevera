import { dataFake } from "@/common/utils/dataFake";
import { atom } from "jotai";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";

import { capitalizar } from "@/common/utils/string";

import { atomFamily } from "jotai/utils";
import type {
  AnimateState,
  Challenge,
  ExploreInfo,
  ListTreeMode,
  NodeEntity,
  PathNode,
} from "@/common/types/tree-atoms";
import type { Rank, Taxon } from "@/common/types/api";
import type { TaxonDiagnostic } from "@/hooks/use-navigate-to-taxon";

const challenge = atom<Challenge>({ mode: null, status: "NOT_STARTED" });

const exploreInfos = atom<ExploreInfo[]>(dataFake as ExploreInfo[]);

const animate = atom<AnimateState>({
  isShaking: false,
  shakeDirection: true,
});

const nodesAtom = atom<Record<number, NodeEntity>>({});

const rootKeys = atom<number[]>([]);

const expandedNodes = atom<PathNode[]>([]);

const listTreeMode = atom<ListTreeMode | null>(null);

export const selectedSpecieKeyAtom = atom<number | null>(null);

type ListTreeGroupFilter = {
  rank: Rank;
  key: number;
  name: string;
} | null;

const listTreeGroupFilter = atom<ListTreeGroupFilter>(null);

const shortcutScrollTarget = atom<PathNode[] | null>(null);

export const shortcutScrollTargetAtom = atom(
  null,
  (_get, set, nodes: PathNode[] | null) => {
    set(shortcutScrollTarget, nodes);
  },
);

const mergeNodes = atom(null, (_, set, nodes: NodeEntity[]) => {
  set(nodesAtom, (prev) => {
    const next = { ...prev };
    nodes.forEach((n) => {
      next[n.key] = { ...next[n.key], ...n };
    });
    return next;
  });
});

export const searchQAtom = atom("");
export const searchKingdomAtom = atom("");
export const searchRankAtom = atom<Rank | "">("");
export const searchResultsAtom = atom<Taxon[] | null>(null);
export const searchErrorAtom = atom<string | null>(null);
export const searchSelectedAtom = atom<Taxon | null>(null);
export const searchMinimizedAtom = atom(false);
export const searchDiagnosisAtom = atom<TaxonDiagnostic | null>(null);

export const focusSearchAtom = atom<{ kingdom: string } | null>(null);
export const setFocusSearchAtom = atom(
  null,
  (_get, set, v: { kingdom: string } | null) => {
    set(focusSearchAtom, v);
  },
);

export const injectPathNodesAtom = atom(null, (_, set, nodes: NodeEntity[]) => {
  set(nodesAtom, (prev) => {
    const next = { ...prev };
    nodes.forEach((n) => {
      const existing = prev[n.key];
      if (!existing) {
        next[n.key] = n;
      } else if (
        existing.parentKey === undefined &&
        n.parentKey !== undefined
      ) {
        next[n.key] = { ...existing, parentKey: n.parentKey };
      }
      if (n.parentKey !== undefined) {
        const parent = next[n.parentKey];
        if (parent?.childrenKeys && !parent.childrenKeys.includes(n.key)) {
          next[n.parentKey] = {
            ...parent,
            childrenKeys: [...parent.childrenKeys, n.key],
          };
        }
      }
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

type OpenListTreeModePayload = Omit<ListTreeMode, "previousRootKeys"> & {
  nodes: NodeEntity[];
};

export const openListTreeModeAtom = atom(
  null,
  (get, set, payload: OpenListTreeModePayload) => {
    const currentMode = get(listTreeMode);
    const previousRootKeys = currentMode?.previousRootKeys ?? get(rootKeys);
    const nextMode: ListTreeMode = {
      title: payload.title,
      speciesCount: payload.speciesCount,
      species: payload.species,
      rootKeys: payload.rootKeys,
      childrenByKey: payload.childrenByKey,
      expandedKeys: payload.expandedKeys,
      previousRootKeys,
    };

    set(listTreeMode, nextMode);
    set(rootKeys, payload.rootKeys);
    set(expandedNodes, []);
    set(selectedSpecieKeyAtom, null);
    set(listTreeGroupFilter, null);
    set(shortcutScrollTarget, null);
    set(scrollToRank, null);
    set(scrollToNodeKey, null);
    prevExpandedKeys = new Set<number>();

    set(nodesAtom, (prev) => {
      const next = { ...prev };

      for (const key of Object.keys(next)) {
        const numericKey = Number(key);
        if (next[numericKey]?.expanded) {
          next[numericKey] = { ...next[numericKey], expanded: false };
        }
      }

      for (const node of payload.nodes) {
        const existing = next[node.key];
        next[node.key] = {
          ...existing,
          ...node,
          childrenKeys: existing?.childrenKeys,
          expanded: payload.expandedKeys.includes(node.key),
        };
      }

      return next;
    });
  },
);

export const clearListTreeModeAtom = atom(null, (get, set) => {
  const mode = get(listTreeMode);
  if (!mode) return;

  set(listTreeMode, null);
  set(
    rootKeys,
    mode.previousRootKeys.length
      ? mode.previousRootKeys
      : Object.keys(NAME_KINGDOM_BY_KEY).map(Number),
  );
  set(expandedNodes, []);
  set(selectedSpecieKeyAtom, null);
  set(listTreeGroupFilter, null);
  set(shortcutScrollTarget, null);
  set(scrollToRank, null);
  set(scrollToNodeKey, null);
  prevExpandedKeys = new Set<number>();

  set(nodesAtom, (prev) => {
    const next = { ...prev };

    for (const key of mode.expandedKeys) {
      if (next[key]) next[key] = { ...next[key], expanded: false };
    }

    return next;
  });
});

export const updateListTreeSpeciesFavoriteAtom = atom(
  null,
  (
    get,
    set,
    payload: { gbifKey: number; isFavorite: boolean },
  ) => {
    const mode = get(listTreeMode);
    if (!mode) return;

    set(listTreeMode, {
      ...mode,
      species: mode.species.map((item) =>
        item.gbifKey === payload.gbifKey
          ? { ...item, isFavorite: payload.isFavorite }
          : item,
      ),
    });
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

      const apiChildKeys = new Set(children.map((c) => c.key));
      const existing = prev[key]?.childrenKeys ?? [];
      const pinned = existing.filter(
        (ck) => !apiChildKeys.has(ck) && prev[ck]?.parentKey === key,
      );

      next[key] = {
        ...(next[key] ?? {}),
        childrenKeys: [...children.map((c) => c.key), ...pinned],
      };

      return next;
    });
  },
);

export const toggleNodeAtom = atom(null, (get, set, key: number) => {
  const allNodes = get(nodesAtom);
  const targetNode = allNodes[key];

  if (!targetNode) return;

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

  if (get(listTreeMode)) {
    if (targetNode.rank !== "SPECIES") {
      const selectedNode = newPathNodes[newPathNodes.length - 1];

      set(listTreeGroupFilter, {
        rank: selectedNode.rank,
        key: selectedNode.key,
        name: selectedNode.name,
      });
      return;
    }

    set(expandedNodes, newPathNodes);
    set(selectedSpecieKeyAtom, key);
    return;
  }

  const expandedPath = get(expandedNodes);
  const pathIndex = expandedPath.findIndex((n) => n.key === key);

  if (pathIndex !== -1) {
    set(expandedNodes, expandedPath.slice(0, pathIndex));
    return;
  }

  set(expandedNodes, newPathNodes);
});

let prevExpandedKeys = new Set<number>();

export const syncExpandedWithNodesAtom = atom(null, (get, set) => {
  if (get(listTreeMode)) return;

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

const challengeTipsOpen = atom(false);

export const setChallengeTipsOpenAtom = atom(
  null,
  (_get, set, open: boolean) => {
    set(challengeTipsOpen, open);
  },
);

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

const highlightedKeys = atom<ReadonlySet<number>>(new Set<number>());

export const setHighlightedKeysAtom = atom(
  null,
  (_get, set, keys: number[]) => {
    set(highlightedKeys, new Set(keys));
  },
);

export const removeHighlightedKeyAtom = atom(null, (_get, set, key: number) => {
  set(highlightedKeys, (prev) => {
    const next = new Set(prev);
    next.delete(key);
    return next;
  });
});

const scrollToNodeKey = atom<number | null>(null);

export const scrollToNodeKeyAtom = atom(
  null,
  (_get, set, key: number | null) => {
    set(scrollToNodeKey, key);
  },
);

const playedStepAudioAtom = atom<Record<string, true>>({});

const challengeCorrectPath = atom<
  Array<{ rank: string; name: string; key: number }>
>([]);

export const setChallengeCorrectPathAtom = atom(
  null,
  (_get, set, path: Array<{ rank: string; name: string; key: number }>) => {
    set(challengeCorrectPath, path);
  },
);

const challengeFeedbackMap = atom((get) => {
  const path = get(expandedNodes);
  const correct = get(challengeCorrectPath);
  const ch = get(challenge);
  const active = ch.status === "IN_PROGRESS" || ch.status === "COMPLETED";

  const map = new Map<number, "success" | "error">();
  if (!active || correct.length === 0) return map;

  for (let i = 0; i < path.length; i++) {
    const expanded = path[i];
    const expected = correct[i];
    if (!expected) continue;
    const isCorrect =
      expanded.name.toLowerCase() === expected.name.toLowerCase();
    map.set(expanded.key, isCorrect ? "success" : "error");
  }

  return map;
});

export const treeAtom = {
  challenge,
  exploreInfos,
  animate,
  expandedNodes,
  highlightedRank,
  highlightedKeys,
  scrollToRank,
  scrollToNodeKey,
  shortcutScrollTarget,
  feedbackAudio: playedStepAudioAtom,
  nodes: nodesAtom,
  rootKeys,
  listTreeMode,
  listTreeGroupFilter,
  mergeNodes,
  challengeTipsOpen,
  challengeCorrectPath,
  challengeFeedbackMap,
};
