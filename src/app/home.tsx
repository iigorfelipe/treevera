import { lazy, Suspense, useEffect } from "react";
import { useResponsive } from "@/hooks/use-responsive";
import { useAtomValue, useSetAtom } from "jotai";
import { resetTreeHomeAtom, treeAtom } from "@/store/tree";
import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";

const HomeMobile = lazy(() =>
  import("@/modules/home/mobile").then((m) => ({ default: m.HomeMobile })),
);
const HomeDesktop = lazy(() =>
  import("@/modules/home/desktop").then((m) => ({ default: m.HomeDesktop })),
);

const HomeFallback = () => <div className="bg-background min-h-screen" />;

export const Home = () => {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const challenge = useAtomValue(treeAtom.challenge);
  const setChallenge = useSetAtom(treeAtom.challenge);
  const resetTreeHome = useSetAtom(resetTreeHomeAtom);
  const location = useLocation();
  const isOnHome = location.pathname === "/";
  const isOnChallenges = location.pathname.startsWith("/challenges");
  const isOnTree = location.pathname.startsWith("/tree");

  useDocumentTitle(
    isOnChallenges
      ? t("nav.challenges")
      : isOnTree
        ? t("settings.nav.tree")
        : undefined,
  );

  useEffect(() => {
    if (isOnHome) return;

    setChallenge((prev) => {
      if (prev.status === "IN_PROGRESS" || prev.status === "COMPLETED") {
        return prev;
      }
      return isOnChallenges
        ? { mode: "UNSET", status: "NOT_STARTED" }
        : { mode: null, status: "NOT_STARTED" };
    });
  }, [isOnChallenges, isOnHome, setChallenge]);

  useEffect(() => {
    if (!isOnHome || challenge.status === "IN_PROGRESS") return;

    resetTreeHome();
  }, [challenge.status, isOnHome, resetTreeHome]);

  if (isTablet) {
    return (
      <Suspense fallback={<HomeFallback />}>
        <HomeMobile />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeDesktop />
    </Suspense>
  );
};
