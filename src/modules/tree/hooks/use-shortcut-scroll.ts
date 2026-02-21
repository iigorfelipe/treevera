import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { Virtualizer } from "@tanstack/react-virtual";
import { treeAtom, shortcutScrollTargetAtom } from "@/store/tree";
import type { FlattenedNode } from "./useVirtualTree";
import { useResponsive } from "@/hooks/use-responsive";

export function useShortcutScroll(
  flattened: FlattenedNode[],
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
) {
  const expandedPath = useAtomValue(treeAtom.expandedNodes);
  const shortcutTarget = useAtomValue(treeAtom.shortcutScrollTarget);
  const clearTarget = useSetAtom(shortcutScrollTargetAtom);
  const { isMobile } = useResponsive();

  const lastScrollRef = useRef<{
    targetPath: typeof shortcutTarget;
    scrolledKey: number | null;
  }>({ targetPath: null, scrolledKey: null });

  useEffect(() => {
    if (!shortcutTarget || shortcutTarget.length === 0) {
      lastScrollRef.current = { targetPath: null, scrolledKey: null };
      return;
    }

    if (lastScrollRef.current.targetPath !== shortcutTarget) {
      lastScrollRef.current = { targetPath: shortcutTarget, scrolledKey: null };

      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    let scrollKey: number | null = null;
    for (let i = shortcutTarget.length - 1; i >= 0; i--) {
      const key = shortcutTarget[i].key;
      if (
        expandedPath.some((p) => p.key === key) &&
        flattened.some((item) => item.key === key)
      ) {
        scrollKey = key;
        break;
      }
    }

    if (scrollKey === null) return;
    if (scrollKey === lastScrollRef.current.scrolledKey) return;

    lastScrollRef.current.scrolledKey = scrollKey;

    const targetIndex = flattened.findIndex((item) => item.key === scrollKey);
    if (targetIndex === -1) return;

    rowVirtualizer.scrollToIndex(targetIndex, {
      align: "start",
      behavior: "smooth",
    });

    if (scrollKey === shortcutTarget[shortcutTarget.length - 1]?.key) {
      clearTarget(null);
    }
  }, [
    shortcutTarget,
    expandedPath,
    flattened,
    rowVirtualizer,
    clearTarget,
    isMobile,
  ]);
}
