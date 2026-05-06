import { useAtomValue, useSetAtom } from "jotai";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { Header } from "@/modules/header";
import { treeAtom, selectedSpecieKeyAtom } from "@/store/tree";
import { Tree } from "@/app/tree";
import { ExploreInfo } from "@/app/details/explore-info";
import { HomeInitialPanel } from "@/modules/home/initial-panel";
import { cn } from "@/common/utils/cn";

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
  const { t } = useTranslation();
  const location = useLocation();
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const challenge = useAtomValue(treeAtom.challenge);
  const listTreeMode = useAtomValue(treeAtom.listTreeMode);
  const mobileTreeView = useAtomValue(treeAtom.mobileTreeView);
  const mobileListTreeView = useAtomValue(treeAtom.mobileListTreeView);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const setMobileTreeView = useSetAtom(treeAtom.mobileTreeView);
  const setMobileListTreeView = useSetAtom(treeAtom.mobileListTreeView);
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
    setMobileTreeView(false);
  }, [
    challenge.mode,
    isHomeRoute,
    listTreeMode,
    setExpandedNodes,
    setMobileTreeView,
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

  if (!challenge.mode && listTreeMode) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="bg-background/95 sticky top-0 z-20 border-y px-3 py-2 backdrop-blur">
          <div className="bg-muted/70 grid grid-cols-2 rounded-lg p-1">
            {(["tree", "content"] as const).map((view) => {
              const active = mobileListTreeView === view;

              return (
                <button
                  key={view}
                  type="button"
                  onClick={() => setMobileListTreeView(view)}
                  aria-pressed={active}
                  className={cn(
                    "h-9 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`listTreePanel.mobileTabs.${view}`)}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mobileListTreeView}
            initial={{
              opacity: 0,
              x: mobileListTreeView === "tree" ? -28 : 28,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: mobileListTreeView === "tree" ? 28 : -28,
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="min-w-0 flex-1"
          >
            {mobileListTreeView === "tree" ? <Tree /> : <ExploreInfo />}
          </motion.div>
        </AnimatePresence>
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
      {!challenge.mode && isSpecie && !listTreeMode && !mobileTreeView ? (
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
