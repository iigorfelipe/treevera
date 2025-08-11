import { useGetKingdoms } from "@/hooks/queries/useGetKingdoms";
import "./tree.css";
import { TreeNode } from "@/modules/tree/tree-node";
import { TreeSkeleton } from "@/modules/tree/components/tree-skeleton";

export const Tree = () => {
  const { data: kingdoms, isLoading } = useGetKingdoms();

  if (isLoading) return <TreeSkeleton />;

  if (!kingdoms || kingdoms.length === 0) return <h1>Sem dados</h1>;

  return (
    <div
      className="flex h-full w-full flex-col gap-6 overflow-auto px-4 py-28"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ul>
        {kingdoms.map((kingdom) => (
          <TreeNode key={kingdom.key} taxon={kingdom} />
        ))}
      </ul>
    </div>
  );
};
