import { useAtomValue } from "jotai";
import { Tree } from "./tree";
import { SpecieDetail } from "./details/specie-detail";
import { ExploreInfo } from "./details/explore-info";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/common/components/ui/resizable";
import { Header } from "@/modules/header";
import { useResponsive } from "@/hooks/use-responsive";
import { treeAtom } from "@/store/tree";
import { DailyChallenge } from "./auth/challenge";

export const Home = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challengeMode = useAtomValue(treeAtom.challenge).mode;
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");

  const { isTablet } = useResponsive();

  return isTablet ? (
    <div className="flex flex-col">
      <Header />
      {isSpecie ? (
        <SpecieDetail />
      ) : (
        <>
          <Tree />
          <ExploreInfo />
        </>
      )}
    </div>
  ) : (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel
        className="relative"
        defaultSize={480}
        minSize={452}
        maxSize={855}
      >
        <Header />
        <Tree />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="flex w-full flex-col gap-4">
        <div className="h-screen w-full overflow-auto">
          {!challengeMode ? (
            isSpecie ? (
              <SpecieDetail />
            ) : (
              <ExploreInfo />
            )
          ) : (
            <>
              <DailyChallenge />
            </>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
