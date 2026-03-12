import { useCallback, useMemo, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  TREE_TOGGLE_BUTTON_DIAMETER_PX,
  TREE_TOGGLE_BUTTON_OFFSET_X_PX,
  COLOR_KINGDOM_BY_NAME,
  TREE_CONNECTOR_LINE_WIDTH_PX,
  TREE_CONNECTOR_HORIZONTAL_LENGTH_PX,
  TREE_LEVEL_INDENT_PX,
} from "@/common/constants/tree";
import type { NodeEntity } from "@/common/types/tree-atoms";

export type FlattenedNode = {
  key: number;
  level: number;
  isEmptyInfo?: true;
  isSearchBanner?: true;
  parentNodeKey?: number;
};

export type Connector = {
  top: number;
  left: number;
  height: number;
  color: string;
};

export const useVirtualTree = (
  nodes: Record<number, NodeEntity>,
  roots: number[],
  parentRef: RefObject<HTMLDivElement | null>,
) => {
  const flattenTree = useCallback(
    (
      nodes: Record<number, NodeEntity>,
      keys: number[],
      level = 0,
    ): FlattenedNode[] => {
      const result: FlattenedNode[] = [];

      for (const key of keys) {
        const node = nodes[key];
        if (!node) continue;

        result.push({ key, level });

        if (node.expanded && node.childrenKeys?.length) {
          const children = flattenTree(nodes, node.childrenKeys, level + 1);
          for (let i = 0; i < children.length; i++) result.push(children[i]);

          if (node.rank !== "KINGDOM") {
            result.push({
              key: -(node.key + 3_000_000_000),
              level: level + 1,
              isSearchBanner: true,
              parentNodeKey: node.key,
            });
          }
        } else if (
          node.expanded &&
          node.rank !== "KINGDOM" &&
          node.rank !== "SPECIES" &&
          node.numDescendants === 0
        ) {
          result.push({
            key: -key,
            level: level + 1,
            isEmptyInfo: true,
            parentNodeKey: key,
          });
        }
      }

      return result;
    },
    [],
  );

  const flattened = useMemo(() => {
    const result = flattenTree(nodes, roots);
    let lastBannerIdx = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].isSearchBanner) { lastBannerIdx = i; break; }
    }
    return lastBannerIdx === -1
      ? result
      : result.filter(
          (item, idx) => !item.isSearchBanner || idx === lastBannerIdx,
        );
  }, [flattenTree, nodes, roots]);

  const getRowSize = useCallback(
    (index: number) => {
      const item = flattened[index];
      if (item.isSearchBanner) return 40;
      if (item.isEmptyInfo) return 192;
      return nodes[item.key]?.rank === "KINGDOM" ? 72 : 34;
    },
    [flattened, nodes],
  );

  const positions = useMemo(() => {
    const offsets: number[] = [];
    let currentOffset = 0;

    for (let index = 0; index < flattened.length; index++) {
      offsets[index] = currentOffset;
      currentOffset += getRowSize(index);
    }

    return offsets;
  }, [flattened, getRowSize]);

  const getItemKey = useCallback(
    (index: number) => flattened[index]?.key ?? index,
    [flattened],
  );

  const rowVirtualizer = useVirtualizer({
    count: flattened.length,
    getScrollElement: () => parentRef.current!,
    estimateSize: (index) => getRowSize(index),
    getItemKey,
    overscan: 10,
  });

  const connectors: Connector[] = useMemo(() => {
    const indexByKey = new Map<number, number>();
    flattened.forEach((item, index) => indexByKey.set(item.key, index));

    const result: Connector[] = [];
    const halfThickness = Math.floor(TREE_CONNECTOR_LINE_WIDTH_PX / 2);

    for (let index = 0; index < flattened.length; index++) {
      const { key: parentKey } = flattened[index];
      const parentNode = nodes[parentKey];
      if (!parentNode) continue;
      if (!parentNode.childrenKeys?.length) continue;
      if (!parentNode.expanded) continue;

      const firstChildKey = parentNode.childrenKeys[0];
      const lastChildKey =
        parentNode.childrenKeys[parentNode.childrenKeys.length - 1];

      const firstChildIndex = indexByKey.get(firstChildKey);
      const lastChildIndex = indexByKey.get(lastChildKey);
      if (firstChildIndex === undefined || lastChildIndex === undefined)
        continue;

      const top =
        positions[firstChildIndex] -
        Math.round(getRowSize(firstChildIndex) / 2);
      const bottom =
        positions[lastChildIndex] + Math.round(getRowSize(lastChildIndex) / 2);
      const height = Math.max(0, Math.round(bottom - top));

      const childLevel = flattened[firstChildIndex].level;

      const circleCenterX = Math.round(
        childLevel * TREE_LEVEL_INDENT_PX +
          TREE_TOGGLE_BUTTON_OFFSET_X_PX +
          TREE_TOGGLE_BUTTON_DIAMETER_PX / 2,
      );

      const verticalLeft = circleCenterX - TREE_CONNECTOR_HORIZONTAL_LENGTH_PX;
      const vx = Math.round(verticalLeft);
      const vt = Math.round(top);

      const color =
        parentNode?.color ??
        COLOR_KINGDOM_BY_NAME[
          parentNode.kingdom?.toLocaleLowerCase() as keyof typeof COLOR_KINGDOM_BY_NAME
        ];

      result.push({
        left: vx - halfThickness,
        top: vt,
        height,
        color,
      });
    }

    return result;
  }, [flattened, nodes, positions, getRowSize]);

  return {
    flattened,
    rowVirtualizer,
    connectors,
  };
};
