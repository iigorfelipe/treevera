import { useAtomValue, useSetAtom } from "jotai";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/common/components/ui/resizable";
import { Header } from "@/modules/header";
import { treeAtom, selectedSpecieKeyAtom } from "@/store/tree";
import { Tree } from "@/app/tree";
import { ExploreInfo } from "@/app/details/explore-info";
import { TreePanelLayoutProvider } from "./tree-panel-layout";

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

const PanelFallback = ({
  className = "h-screen w-full",
}: {
  className?: string;
}) => <div className={className} />;

const TREE_PANEL_DEFAULT_WIDTH = 480;
const TREE_PANEL_AUTO_EXPAND_WIDTH = 420;
const TREE_PANEL_COLLAPSED_WIDTH = 92;
const TREE_PANEL_COMPACT_BREAKPOINT = 132;
const TREE_PANEL_DRAG_MIN_WIDTH = 120;
const TREE_PANEL_SNAP_COLLAPSE_WIDTH = 395;

export const HomeDesktop = () => {
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);
  const isSpecie = expandedNodes.find((node) => node.rank === "SPECIES");
  const treePanelRef = useRef<PanelImperativeHandle | null>(null);
  const [isCompactMenu, setIsCompactMenu] = useState(false);

  const isChallengeInProgress = challenge.status === "IN_PROGRESS";
  const isCompleted = challenge.status === "COMPLETED";
  const shouldShowCompactMenu = !isChallengeInProgress && isCompactMenu;

  useEffect(() => {
    if (isCompleted && challenge.speciesKey) {
      setSelectedSpecieKey(challenge.speciesKey);
      return () => setSelectedSpecieKey(null);
    }
  }, [isCompleted, challenge.speciesKey, setSelectedSpecieKey]);

  const requestPanelExpand = useCallback(
    (targetWidth = TREE_PANEL_AUTO_EXPAND_WIDTH) => {
      const panel = treePanelRef.current;
      if (!panel) return;

      const currentWidth = panel.getSize().inPixels;
      if (currentWidth >= targetWidth - 4) return;

      panel.resize(targetWidth);
    },
    [],
  );

  useEffect(() => {
    if (!isChallengeInProgress) return;

    requestPanelExpand();
  }, [isChallengeInProgress, requestPanelExpand]);

  return (
    <TreePanelLayoutProvider
      value={{ isCompactMenu: shouldShowCompactMenu, requestPanelExpand }}
    >
      <ResizablePanelGroup orientation="horizontal" className="min-h-screen">
        <ResizablePanel
          className="relative overflow-hidden border-r"
          defaultSize={TREE_PANEL_DEFAULT_WIDTH}
          minSize={
            isChallengeInProgress
              ? TREE_PANEL_AUTO_EXPAND_WIDTH
              : TREE_PANEL_DRAG_MIN_WIDTH
          }
          maxSize={855}
          collapsible={!isChallengeInProgress}
          collapsedSize={TREE_PANEL_COLLAPSED_WIDTH}
          panelRef={treePanelRef}
          onResize={(size) => {
            const panel = treePanelRef.current;
            const width = size.inPixels;

            if (isChallengeInProgress) {
              if (panel?.isCollapsed())
                panel.resize(TREE_PANEL_AUTO_EXPAND_WIDTH);
              return;
            }

            const collapsed =
              panel?.isCollapsed() ?? width <= TREE_PANEL_COMPACT_BREAKPOINT;

            if (!collapsed && width <= TREE_PANEL_SNAP_COLLAPSE_WIDTH) {
              panel?.collapse();
              setIsCompactMenu(true);
              return;
            }

            setIsCompactMenu(width <= TREE_PANEL_COMPACT_BREAKPOINT);
          }}
        >
          <div className="relative flex h-screen min-w-0 flex-col overflow-hidden">
            <Header
              compact={shouldShowCompactMenu}
              onExpandRequest={() => requestPanelExpand()}
            />
            <div className="relative flex min-h-0 flex-1 flex-col">
              <Tree />
              {isCompleted && (
                <>
                  <div className="absolute inset-0 z-10 bg-black/60" />
                  <Suspense
                    fallback={
                      <PanelFallback className="absolute inset-0 z-20" />
                    }
                  >
                    <ChallengeCompletedOverlay />
                  </Suspense>
                </>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle
          disabled={shouldShowCompactMenu}
          withHandle={!shouldShowCompactMenu}
        />

        <ResizablePanel className="flex w-full min-w-0 flex-col gap-4">
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
                <>
                  <ExploreInfo />
                </>
              ))}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TreePanelLayoutProvider>
  );
};
