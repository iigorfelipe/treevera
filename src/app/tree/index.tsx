import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useGetKingdoms } from "@/hooks/queries/useGetKingdoms";
import { treeAtom } from "@/store/tree";
import { TreeSkeleton } from "@/modules/tree/components/tree-skeleton";
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
          expanded: false,
        })),
      );
      setRootKeys(kingdoms.map((k) => k.key));
    }
  }, [kingdoms, mergeNodes, setRootKeys]);

  if (isLoading) return <TreeSkeleton />;
  if (isError) return <div>Erro ao carregar dados</div>;
  if (!kingdoms) return <div>Sem dados</div>;
  if (kingdoms.length === 0) return <div>Dados vazios</div>;

  return <VirtualTree />;
};
