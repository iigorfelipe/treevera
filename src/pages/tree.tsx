import { useGetKingdoms } from "@/hooks/queries/useGetKingdoms";
import type { Taxon } from "@/common/types/api";
import { getNextRank, getRankIcon } from "@/common/utils/ranks";
import { capitalizar } from "@/common/utils/string";
import { useGetChildren } from "@/hooks/queries/useGetChildren";
import { expandedNodeAtomByRank, specieKeyAtom } from "@/store/tree";
import { useAtom } from "jotai";
import { memo, useCallback, useMemo, useState } from "react";

import "./tree.css";

const TreeNode = memo(({ taxon }: { taxon: Taxon }) => {
  const [specieKey, setSpecieKey] = useAtom(specieKeyAtom);
  const [expandedNodes, setExpandedNodes] = useAtom(expandedNodeAtomByRank);
  const isExpanded = expandedNodes[taxon.rank] === taxon.key;

  const { data: children, isLoading } = useGetChildren({
    parentKey: taxon.key,
    expanded: isExpanded,
  });

  const nextRank = useMemo(() => getNextRank(taxon.rank), [taxon.rank]);

  const filteredChildren = useMemo(
    () =>
      children?.filter((child) => child.rank?.toUpperCase() === nextRank) ?? [],
    [children, nextRank],
  );

  const toggleExpand = () => {
    setExpandedNodes((prev) => {
      const current = prev[taxon.rank];
      return {
        ...prev,
        [taxon.rank]: current === taxon.key ? null : taxon.key,
      };
    });
  };

  const [isShaking, setIsShaking] = useState(false);
  const [shakeDirection, setShakeDirection] = useState(true);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    setIsShaking(true);
    setShakeDirection(true);

    setTimeout(() => setShakeDirection(false), 150);
    setTimeout(() => setIsShaking(false), 300);

    toggleExpand();
  }, []);

  const isLoadNode = useMemo(
    () => isLoading && isExpanded,
    [isExpanded, isLoading],
  );

  const imgRotationClass = useMemo(() => {
    if (isLoadNode) return "animate-wiggle";
    if (isShaking) return shakeDirection ? "rotate-6" : "-rotate-6";
    return "rotate-0";
  }, [isLoadNode, isShaking, shakeDirection]);

  const hoverRotationClass = useMemo(() => {
    return isShaking ? "" : "group-hover:rotate-6";
  }, [isShaking]);

  return (
    <li>
      <details open={isExpanded}>
        <summary onClick={handleClick}>
          <div className="item group flex flex-row items-center gap-2">
            <div
              className={`${isLoadNode && "animate-pulse"} mx-1 flex justify-center`}
            >
              <img
                src={getRankIcon(taxon.kingdom)}
                alt={taxon.scientificName}
                className={`kingdoms-img transition-transform duration-150 ${imgRotationClass} ${hoverRotationClass}`}
              />
            </div>

            <div className="flex items-center justify-center rounded-full border-1 border-gray-300 bg-white px-2 py-[2px]">
              <span className="text-xs">{capitalizar(taxon.rank)}</span>
            </div>

            <span className="font-medium">
              {taxon.canonicalName || taxon.scientificName}
            </span>
          </div>
        </summary>

        {isExpanded &&
          (isLoading ? (
            <p>Carregando...</p>
          ) : filteredChildren.length === 0 ? (
            <div className="flex max-w-xl flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-md">
              <h1 className="mb-4 text-2xl font-semibold text-gray-800">
                Informações não encontradas
              </h1>

              <div className="mb-4 w-full rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                <p className="text-sm">
                  Os dados são fornecidos pela API da <strong>GBIF</strong>, e
                  podem estar incompletos ou ausentes.
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Você pode tentar buscar mais informações no Google pesquisando
                por:{" "}
                <span className="text-blue-600 hover:cursor-pointer hover:underline">
                  {taxon.canonicalName || taxon.scientificName}
                </span>
              </p>
            </div>
          ) : (
            <ul>
              {filteredChildren.map((child) => {
                if (child.rank === "SPECIES") {
                  return (
                    <li key={child.key} onClick={() => setSpecieKey(child.key)}>
                      <div
                        className={
                          "item flex items-center gap-2 transition-colors duration-200" +
                          (specieKey === child.key ? " bg-[#a3d6a3]" : "")
                        }
                      >
                        <div className="flex items-center justify-center rounded-full border-1 border-gray-300 bg-white px-2 py-[2px]">
                          <span className="text-xs">
                            {capitalizar(child.rank.slice(0, -1))}
                          </span>
                        </div>
                        <span>
                          {child.canonicalName || child.scientificName}
                        </span>
                      </div>
                    </li>
                  );
                }
                return <TreeNode key={child.key} taxon={child} />;
              })}
            </ul>
          ))}
      </details>
    </li>
  );
});

export const Tree = () => {
  const { data: kingdoms, isLoading } = useGetKingdoms();

  if (isLoading)
    return (
      <img
        src="./assets/load-icon.png"
        className="h-10 w-fit group-hover:scale-105 group-hover:rotate-5"
        alt=""
      />
    );
  if (!kingdoms || kingdoms.length === 0) return <h1>Sem dados</h1>;

  return (
    <div className="min-w-1/2 rounded-3xl border border-gray-200 bg-white pt-6 pr-[1px] pb-4 pl-2 text-black shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
      <ul className="tree h-full w-full overflow-auto">
        {kingdoms.map((kingdom) => (
          <TreeNode key={kingdom.key} taxon={kingdom} />
        ))}
      </ul>
    </div>
  );
};
