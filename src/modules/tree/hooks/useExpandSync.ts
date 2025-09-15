import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { syncExpandedWithNodesAtom, treeAtom } from "@/store/tree";

export const useExpandedSync = () => {
  const expandedPath = useAtomValue(treeAtom.expandedNodes);
  const sync = useSetAtom(syncExpandedWithNodesAtom);

  useEffect(() => {
    sync();
  }, [expandedPath, sync]);
};
