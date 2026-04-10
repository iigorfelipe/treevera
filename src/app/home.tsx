import { useResponsive } from "@/hooks/use-responsive";
import { HomeMobile } from "@/modules/home/mobile";
import { HomeDesktop } from "@/modules/home/desktop";
import { useSetAtom } from "jotai";
import { treeAtom } from "@/store/tree";
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

export const Home = () => {
  const { isTablet } = useResponsive();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const location = useLocation();
  const isOnChallenges = location.pathname.startsWith("/challenges");

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

  if (isTablet) return <HomeMobile />;

  return <HomeDesktop />;
};
