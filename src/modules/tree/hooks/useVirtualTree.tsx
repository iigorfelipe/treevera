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
};

export type Connector = {
  type: "vertical" | "horizontal";
  top: number;
  left: number;
  width?: number;
  height?: number;
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
      let result: FlattenedNode[] = [];

      for (const key of keys) {
        const node = nodes[key];
        if (!node) continue;

        result.push({ key, level });

        if (node.expanded && node.childrenKeys?.length) {
          result = result.concat(
            flattenTree(nodes, node.childrenKeys, level + 1),
          );
        }
      }

      return result;
    },
    [],
  );

  const flattened = useMemo(
    () => flattenTree(nodes, roots),
    [flattenTree, nodes, roots],
  );

  const getRowSize = useCallback(
    (index: number) =>
      nodes[flattened[index].key]?.rank === "KINGDOM" ? 72 : 34,
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
  }, [flattened.length, getRowSize]);

  const rowVirtualizer = useVirtualizer({
    count: flattened.length,
    getScrollElement: () => parentRef.current!,
    estimateSize: (index) => getRowSize(index),
    overscan: 5,
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

      const childIndices = parentNode.childrenKeys
        .map((childKey) => indexByKey.get(childKey))
        .filter((v): v is number => typeof v === "number");
      if (!childIndices.length) continue;

      const firstChildIndex = Math.min(...childIndices);
      const lastChildIndex = Math.max(...childIndices);

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
        type: "vertical",
        left: vx - halfThickness,
        top: vt,
        height,
        color,
      });

      for (const childKey of parentNode.childrenKeys) {
        const childIndex = indexByKey.get(childKey);
        if (childIndex == null) continue;
        const childY = Math.round(
          positions[childIndex] + getRowSize(childIndex) / 2,
        );

        result.push({
          type: "horizontal",
          left: vx - halfThickness,
          top: childY - halfThickness,
          width: TREE_CONNECTOR_HORIZONTAL_LENGTH_PX + halfThickness,
          color,
        });
      }
    }

    return result;
  }, [flattened, nodes, positions, getRowSize]);

  return {
    flattened,
    rowVirtualizer,
    connectors,
  };
};
