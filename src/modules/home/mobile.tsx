import { useAtomValue, useSetAtom } from "jotai";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

import { Header } from "@/modules/header";
import { treeAtom, selectedSpecieKeyAtom } from "@/store/tree";
import { Tree } from "@/app/tree";
import { ExploreInfo } from "@/app/details/explore-info";
import { HomeInitialPanel } from "@/modules/home/initial-panel";

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
  const location = useLocation();
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const listTreeMode = useAtomValue(treeAtom.listTreeMode);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");

  const isCompleted = challenge.status === "COMPLETED";
  const isHomeRoute = location.pathname === "/";
  const isTreeRoute = location.pathname.startsWith("/tree");
  const isChallengeRoute = location.pathname.startsWith("/challenges");
  const shouldShowTree =
    isTreeRoute ||
    isChallengeRoute ||
    Boolean(challenge.mode) ||
    Boolean(listTreeMode);

  useEffect(() => {
    if (isCompleted && challenge.speciesKey) {
      setSelectedSpecieKey(challenge.speciesKey);
      return () => setSelectedSpecieKey(null);
    }
  }, [isCompleted, challenge.speciesKey, setSelectedSpecieKey]);

  useEffect(() => {
    if (!isHomeRoute || challenge.mode || listTreeMode) return;

    setExpandedNodes([]);
    setSelectedSpecieKey(null);
  }, [
    challenge.mode,
    isHomeRoute,
    listTreeMode,
    setExpandedNodes,
    setSelectedSpecieKey,
  ]);

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

  if (!shouldShowTree) {
    return (
      <div className="flex flex-col">
        <Header />
        <HomeInitialPanel />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header />
      {!challenge.mode && isSpecie && !listTreeMode ? (
        <Suspense fallback={<SectionFallback />}>
          <SpecieDetail />
        </Suspense>
      ) : (
        <>
          <Tree />
          {!challenge.mode && listTreeMode && <ExploreInfo />}
        </>
      )}
    </div>
  );
};
