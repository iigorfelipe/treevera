import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useGetKingdoms } from "@/hooks/queries/useGetKingdoms";
import { treeAtom } from "@/store/tree";
import { TreeState } from "@/modules/tree/tree-state";
import { VirtualTree } from "@/modules/tree/virtual-tree";
import { useTreeUrl } from "@/hooks/use-tree-url";

export const Tree = () => {
  const { data: kingdoms, isLoading, isError } = useGetKingdoms();
  const mergeNodes = useSetAtom(treeAtom.mergeNodes);
  const setRootKeys = useSetAtom(treeAtom.rootKeys);
  const listTreeMode = useAtomValue(treeAtom.listTreeMode);

  useTreeUrl();

  useEffect(() => {
    if (listTreeMode) return;

    if (kingdoms && kingdoms.length > 0) {
      mergeNodes(
        kingdoms.map((kingdom) => ({
          ...kingdom,
        })),
      );
      setRootKeys(kingdoms.map((k) => k.key));
    }
  }, [kingdoms, listTreeMode, mergeNodes, setRootKeys]);

  if (isLoading) return <TreeState type="loading" />;
  if (isError) return <TreeState type="error" />;
  if (!kingdoms || kingdoms.length === 0) return <TreeState type="empty" />;

  return <VirtualTree />;
};
