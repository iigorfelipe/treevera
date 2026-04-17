import { useAtomValue, useSetAtom } from "jotai";
import { lazy, Suspense, useEffect } from "react";

import { Header } from "@/modules/header";
import { treeAtom, selectedSpecieKeyAtom } from "@/store/tree";
import { Tree } from "@/app/tree";
import { ExploreInfo } from "@/app/details/explore-info";

const SpecieDetail = lazy(() =>
  import("@/app/details/specie-detail").then((m) => ({
    default: m.SpecieDetail,
  })),
);
const ChallengeCompletedOverlay = lazy(() =>
  import("@/modules/challenge/completed-overlay").then((m) => ({
    default: m.ChallengeCompletedOverlay,
  })),
);

const SectionFallback = () => <div className="min-h-48 w-full" />;

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
          <Suspense fallback={<SectionFallback />}>
            <ChallengeCompletedOverlay inline />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SpecieDetail embedded />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header />
      {!challenge.mode && isSpecie ? (
        <Suspense fallback={<SectionFallback />}>
          <SpecieDetail />
        </Suspense>
      ) : (
        <>
          <Tree />
          {!challenge.mode && <ExploreInfo />}
        </>
      )}
    </div>
  );
};
