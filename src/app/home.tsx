import { useAtomValue } from "jotai";
import { Tree } from "./tree/tree";
import { SpecieDetail } from "./details/specie-detail";
// import { DailyChallenge } from "./challenge";
import { treeAtom } from "@/store/tree";
import { ExploreInfo } from "./details/explore-info";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/common/components/ui/resizable";
import { Header } from "@/modules/header";
import { Menu } from "@/modules/header/menu";
import { useResponsive } from "@/hooks/use-responsive";

export const Home = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");

  const { isTablet } = useResponsive();

  return isTablet ? (
    <>
      <Header />
      {isSpecie ? (
        <SpecieDetail />
      ) : (
        <>
          <Tree />
          <ExploreInfo />
        </>
      )}
    </>
  ) : (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        className="sm relative h-screen w-full max-w-3/5 min-w-max overflow-auto"
        defaultSize={30}
      >
        <Header />
        <Tree />
        <Menu />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="flex w-full flex-col gap-4">
        {/* <DailyChallenge /> */}
        <div className="h-[100vh] w-full overflow-auto">
          {isSpecie ? <SpecieDetail /> : <ExploreInfo />}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
