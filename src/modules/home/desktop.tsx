import { useAtomValue } from "jotai";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/common/components/ui/resizable";
import { Header } from "@/modules/header";
import { treeAtom } from "@/store/tree";
import { Tree } from "@/app/tree";
import { Challenges } from "@/app/challenges";
import { SpecieDetail } from "@/app/details/specie-detail";
import { ExploreInfo } from "@/app/details/explore-info";

export const HomeDesktop = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");

  return (
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
          {challenge.mode && <Challenges />}
          {!challenge.mode && (isSpecie ? <SpecieDetail /> : <ExploreInfo />)}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
