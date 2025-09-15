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
import { Menu } from "@/modules/header/menu";
import { useResponsive } from "@/hooks/use-responsive";
import { treeAtom } from "@/store/tree";

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
        className="relative"
        defaultSize={30}
        minSize={20}
        maxSize={40}
      >
        <Header />
        <Tree />
        <Menu />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="flex w-full flex-col gap-4">
        <div className="h-[100vh] w-full overflow-auto">
          {isSpecie ? <SpecieDetail /> : <ExploreInfo />}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
