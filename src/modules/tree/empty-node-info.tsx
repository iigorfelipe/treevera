import { useAtomValue } from "jotai";
import { nodeAtomFamily } from "@/store/tree";
import { TREE_LEVEL_INDENT_PX } from "@/common/constants/tree";

type Props = {
  parentNodeKey: number;
  level: number;
};

export const EmptyNodeInfoCard = ({ parentNodeKey, level }: Props) => {
  const node = useAtomValue(nodeAtomFamily(parentNodeKey));

  if (!node) return null;

  const name =
    node.canonicalName || node.scientificName || String(parentNodeKey);
  const gbifUrl = `https://www.gbif.org/species/${parentNodeKey}`;

  return (
    <div
      className="-ml-4 flex h-full w-full min-w-0 items-start"
      style={{ paddingLeft: level * TREE_LEVEL_INDENT_PX }}
    >
      <div className="bg-muted/40 flex w-full min-w-0 flex-col divide-y overflow-hidden rounded-lg border text-xs">
        <p className="px-3 py-2 leading-relaxed">
          <span className="font-medium italic">{name}</span> está registrado
          como uma classificação aceita no{" "}
          <a
            href={gbifUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline"
          >
            GBIF
          </a>
          , mas não possui descendentes registrados.
        </p>
        <p className="text-muted-foreground px-3 py-2 leading-relaxed">
          Caso não queira ver nós sem descendentes, desative em{" "}
          <span className="font-medium">
            Menu &gt; Configurações &gt; Exibir nós sem descendentes
          </span>
          .
        </p>
      </div>
    </div>
  );
};
