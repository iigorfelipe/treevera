import { useAtomValue } from "jotai";

import { Header } from "@/modules/header";
import { treeAtom } from "@/store/tree";
import { SpecieDetail } from "@/app/details/specie-detail";
import { Tree } from "@/app/tree";
import { ExploreInfo } from "@/app/details/explore-info";

export const HomeMobile = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");

  return (
    <div className="flex flex-col">
      <Header />
      {!challenge.mode && isSpecie ? (
        <SpecieDetail />
      ) : (
        <>
          <Tree />
          {!challenge.mode && <ExploreInfo />}
        </>
      )}
    </div>
  );
};
