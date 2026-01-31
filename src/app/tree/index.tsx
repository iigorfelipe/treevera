import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useGetKingdoms } from "@/hooks/queries/useGetKingdoms";
import { treeAtom } from "@/store/tree";
import { TreeState } from "@/modules/tree/tree-state";
import { VirtualTree } from "@/modules/tree/virtual-tree";

export const Tree = () => {
  const { data: kingdoms, isLoading, isError } = useGetKingdoms();
  const mergeNodes = useSetAtom(treeAtom.mergeNodes);
  const setRootKeys = useSetAtom(treeAtom.rootKeys);

  useEffect(() => {
    if (kingdoms && kingdoms.length > 0) {
      mergeNodes(
        kingdoms.map((kingdom) => ({
          ...kingdom,
        })),
      );
      setRootKeys(kingdoms.map((k) => k.key));
    }
  }, [kingdoms, mergeNodes, setRootKeys]);

  if (isLoading) return <TreeState type="loading" />;
  if (isError) return <TreeState type="error" />;
  if (!kingdoms || kingdoms.length === 0) return <TreeState type="empty" />;

  return <VirtualTree />;
};
