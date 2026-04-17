import { useAtomValue, useSetAtom } from "jotai";
import { lazy, Suspense, useEffect } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/common/components/ui/resizable";
import { Header } from "@/modules/header";
import { treeAtom, selectedSpecieKeyAtom } from "@/store/tree";
import { Tree } from "@/app/tree";
import { ExploreInfo } from "@/app/details/explore-info";

const Challenges = lazy(() =>
  import("@/app/challenges").then((m) => ({ default: m.Challenges })),
);
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

const PanelFallback = ({ className = "h-screen w-full" }: { className?: string }) => (
  <div className={className} />
);

export const HomeDesktop = () => {
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

  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel
        className="relative"
        defaultSize={480}
        minSize={452}
        maxSize={855}
      >
        <Header />
        <div className="relative">
          <Tree />
          {isCompleted && (
            <>
              <div className="absolute inset-0 z-10 bg-black/60" />
              <Suspense
                fallback={<PanelFallback className="absolute inset-0 z-20" />}
              >
                <ChallengeCompletedOverlay />
              </Suspense>
            </>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel className="flex w-full flex-col gap-4">
        <div className="h-screen w-full overflow-auto">
          {isCompleted && (
            <Suspense fallback={<PanelFallback />}>
              <SpecieDetail embedded />
            </Suspense>
          )}
          {!isCompleted && challenge.mode && (
            <Suspense fallback={<PanelFallback />}>
              <Challenges />
            </Suspense>
          )}
          {!isCompleted &&
            !challenge.mode &&
            (isSpecie ? (
              <Suspense fallback={<PanelFallback />}>
                <SpecieDetail />
              </Suspense>
            ) : (
              <ExploreInfo />
            ))}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
