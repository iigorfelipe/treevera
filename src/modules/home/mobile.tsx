import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { Header } from "@/modules/header";
import { treeAtom, selectedSpecieKeyAtom } from "@/store/tree";
import { SpecieDetail } from "@/app/details/specie-detail";
import { Tree } from "@/app/tree";
import { ExploreInfo } from "@/app/details/explore-info";
import { ChallengeCompletedOverlay } from "@/modules/challenge/completed-overlay";

export const HomeMobile = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");

  const isCompleted = challenge.status === "COMPLETED";

  useEffect(() => {
    if (isCompleted && challenge.speciesKey) {
      setSelectedSpecieKey(challenge.speciesKey);
      return () => setSelectedSpecieKey(null);
    }
  }, [isCompleted, challenge.speciesKey, setSelectedSpecieKey]);

  if (isCompleted) {
    return (
      <div className="flex flex-col">
        <Header />
        <div className="flex flex-col gap-4 px-2 pt-2 pb-10">
          <ChallengeCompletedOverlay inline />
          <SpecieDetail embedded />
        </div>
      </div>
    );
  }

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
