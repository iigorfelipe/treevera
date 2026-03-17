import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/common/components/ui/resizable";
import { Header } from "@/modules/header";
import { treeAtom, selectedSpecieKeyAtom } from "@/store/tree";
import { Tree } from "@/app/tree";
import { Challenges } from "@/app/challenges";
import { SpecieDetail } from "@/app/details/specie-detail";
import { ExploreInfo } from "@/app/details/explore-info";
import { ChallengeCompletedOverlay } from "@/modules/challenge/completed-overlay";

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
              <ChallengeCompletedOverlay />
            </>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel className="flex w-full flex-col gap-4">
        <div className="h-screen w-full overflow-auto">
          {isCompleted && <SpecieDetail embedded />}
          {!isCompleted && challenge.mode && <Challenges />}
          {!isCompleted &&
            !challenge.mode &&
            (isSpecie ? <SpecieDetail /> : <ExploreInfo />)}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
