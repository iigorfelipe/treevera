import { useGetKingdoms } from "@/hooks/queries/useGetKingdoms";
import "./tree.css";
import { TreeNode } from "@/modules/tree/tree-node";
import { TreeSkeleton } from "@/modules/tree/components/tree-skeleton";

// const Filters = () => {
//   return (
//     <div className="flex max-w-2xs flex-col gap-4">
//       <div className="group flex h-12 w-full items-center gap-4 rounded-xl border px-4 py-3 text-sm">
//         <img
//           src="./assets/search-icon.png"
//           className="h-full w-fit rotate-y-180 group-hover:scale-110 group-hover:rotate-5"
//           alt=""
//         />
//         <input
//           type="text"
//           placeholder="Buscar espécie..."
//           className="outline-none placeholder:font-medium"
//         />
//       </div>
//     </div>
//   );
// };

export const Tree = () => {
  const { data: kingdoms, isLoading } = useGetKingdoms();

  if (isLoading) return <TreeSkeleton />;

  if (!kingdoms || kingdoms.length === 0) return <h1>Sem dados</h1>;

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto px-4 py-28">
      {/* <Filters /> */}

      <ul>
        {kingdoms.map((kingdom) => (
          <TreeNode key={kingdom.key} taxon={kingdom} />
        ))}
      </ul>
    </div>
  );
};
