import { useResponsive } from "@/hooks/use-responsive";
import { HomeMobile } from "@/modules/home/mobile";
import { HomeDesktop } from "@/modules/home/desktop";
import { useSetAtom } from "jotai";
import { treeAtom } from "@/store/tree";
import { useEffect } from "react";
import { useMatch } from "@tanstack/react-router";

export const Home = () => {
  const { isTablet } = useResponsive();
  const setChallenge = useSetAtom(treeAtom.challenge);

  const challengesMatch = useMatch({
    from: "/challenges",
    shouldThrow: false,
  });

  useEffect(() => {
    if (challengesMatch) {
      setChallenge({ mode: "UNSET", status: "NOT_STARTED" });
    }
  }, [challengesMatch, setChallenge]);

  if (isTablet) return <HomeMobile />;

  return <HomeDesktop />;
};
