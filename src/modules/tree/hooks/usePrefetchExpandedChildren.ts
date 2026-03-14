import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";

import { treeAtom, setNodeChildrenAtom } from "@/store/tree";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { mapToTaxon, isBackboneNode } from "@/hooks/queries/useGetChildren";
import type { RawGbifChild, ChildrenQueryResult } from "@/hooks/queries/useGetChildren";
import { filterChildren } from "@/common/utils/tree/children";
import { getChildren } from "@/services/apis/gbif";
import { showEmptyNodesAtom } from "@/store/user-settings";

export function usePrefetchExpandedChildren() {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const nodes = useAtomValue(treeAtom.nodes);
  const shortcutTarget = useAtomValue(treeAtom.shortcutScrollTarget);
  const setNodeChildren = useSetAtom(setNodeChildrenAtom);
  const showEmptyNodes = useAtomValue(showEmptyNodesAtom);
  const queryClient = useQueryClient();

  const inflight = useRef(new Set<number>());

  useEffect(() => {
    inflight.current.clear();
  }, [shortcutTarget]);

  useEffect(() => {
    if (!shortcutTarget || shortcutTarget.length === 0) return;

    for (const pathNode of expandedNodes) {
      const node = nodes[pathNode.key];

      if (!node) continue;
      if (node.rank === "SPECIES") continue;
      if (!node.expanded) continue;
      if (node.childrenKeys !== undefined) continue;
      if (node.numDescendants === 0) continue;
      if (inflight.current.has(node.key)) continue;

      const key = node.key;
      inflight.current.add(key);

      queryClient
        .fetchQuery<ChildrenQueryResult>({
          queryKey: [QUERY_KEYS.children_key, key, showEmptyNodes],
          queryFn: async () => {
            const raw = await getChildren(key);

            const filtered = (raw as RawGbifChild[]).filter(isBackboneNode);

            const visible = showEmptyNodes
              ? filtered
              : filtered.filter(
                  (item) => item.numDescendants > 0 || item.rank === "SPECIES",
                );

            return {
              children: filterChildren(visible, node.rank).map(mapToTaxon),
            };
          },
          staleTime: 1000 * 60 * 60 * 24,
        })
        .then(({ children }) => {
          setNodeChildren({ key, children });
        })
        .finally(() => {
          inflight.current.delete(key);
        });
    }
  }, [
    shortcutTarget,
    expandedNodes,
    nodes,
    showEmptyNodes,
    queryClient,
    setNodeChildren,
  ]);
}
