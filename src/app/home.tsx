import { lazy, Suspense, useEffect } from "react";
import { useResponsive } from "@/hooks/use-responsive";
import { useSetAtom } from "jotai";
import { treeAtom } from "@/store/tree";
import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";

const HomeMobile = lazy(() =>
  import("@/modules/home/mobile").then((m) => ({ default: m.HomeMobile })),
);
const HomeDesktop = lazy(() =>
  import("@/modules/home/desktop").then((m) => ({ default: m.HomeDesktop })),
);

const HomeFallback = () => <div className="min-h-screen bg-background" />;

export const Home = () => {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const location = useLocation();
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
    setChallenge((prev) => {
      if (prev.status === "IN_PROGRESS" || prev.status === "COMPLETED") {
        return prev;
      }
      return isOnChallenges
        ? { mode: "UNSET", status: "NOT_STARTED" }
        : { mode: null, status: "NOT_STARTED" };
    });
  }, [isOnChallenges, setChallenge]);

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
