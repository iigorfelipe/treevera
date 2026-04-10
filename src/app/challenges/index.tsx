import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { treeAtom, setHighlightedKeysAtom } from "@/store/tree";
import { useAtomValue, useSetAtom } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { DailyChallengeInProgress } from "../../modules/challenge/daily/daily-in-progress";
import { RandomChallengeInProgress } from "../../modules/challenge/random/random-in-progress";
import { CustomChallengeInProgress } from "../../modules/challenge/custom/custom-challenge-in-progress";
import { ChallengesLobby } from "@/modules/challenge/lobby";
import { useMidnightRefresh } from "@/hooks/use-midnight-refresh";

const getTodayKey = () => new Date().toDateString();
const getTodayUTC = () => new Date().toISOString().slice(0, 10);

export const PENDING_CHALLENGE_KEY = "pendingChallengeShare";

type ChallengeMode = "DAILY" | "RANDOM" | "CUSTOM";

export type PendingChallengeShare = {
  mode: ChallengeMode;
  speciesKey: number;
  speciesName: string;
};

export const Challenges = () => {
  const challenge = useAtomValue(treeAtom.challenge);
  const setChallenge = useSetAtom(treeAtom.challenge);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const setHighlightedKeys = useSetAtom(setHighlightedKeysAtom);
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const queryClient = useQueryClient();
  const [dayKey, setDayKey] = useState(getTodayKey);

  useMidnightRefresh(() => {
    void queryClient.invalidateQueries({ queryKey: ["challenge_dates"] });
    setDayKey(getTodayKey());
  });

  useEffect(() => {
    if (challenge.status === "IN_PROGRESS" || challenge.status === "COMPLETED")
      return;
    if (!isAuthenticated) {
      const search = new URLSearchParams(window.location.search);
      const speciesParam = search.get("species");
      const nameParam = search.get("name") ?? "";
      const speciesKey = speciesParam ? Number(speciesParam) : 0;

      const pathname = window.location.pathname;
      let mode: ChallengeMode | null = null;
      if (pathname.includes("/challenges/daily")) mode = "DAILY";
      else if (pathname.includes("/challenges/random")) mode = "RANDOM";
      else if (pathname.includes("/challenges/custom")) mode = "CUSTOM";

      if (speciesKey && mode) {
        sessionStorage.setItem(
          PENDING_CHALLENGE_KEY,
          JSON.stringify({
            mode,
            speciesKey,
            speciesName: nameParam,
          } satisfies PendingChallengeShare),
        );
      }
      return;
    }

    const search = new URLSearchParams(window.location.search);
    const speciesParam = search.get("species");
    const nameParam = search.get("name") ?? "";
    const speciesKey = speciesParam ? Number(speciesParam) : 0;

    const pathname = window.location.pathname;
    let mode: ChallengeMode | null = null;
    if (pathname.includes("/challenges/daily")) mode = "DAILY";
    else if (pathname.includes("/challenges/random")) mode = "RANDOM";
    else if (pathname.includes("/challenges/custom")) mode = "CUSTOM";

    if (speciesKey && mode) {
      window.history.replaceState({}, "", pathname);
      setExpandedNodes([]);
      setHighlightedKeys([]);
      setChallenge({
        mode,
        status: "IN_PROGRESS",
        targetSpecies: nameParam,
        speciesKey,
        startedAt: Date.now(),
        errorTracking: { count: 0, perStep: [] },
        stepInteractions: {},
        ...(mode === "DAILY" ? { challengeDate: getTodayUTC() } : {}),
      });
      return;
    }

    const pending = sessionStorage.getItem(PENDING_CHALLENGE_KEY);
    if (pending) {
      sessionStorage.removeItem(PENDING_CHALLENGE_KEY);
      const {
        mode: m,
        speciesKey: sk,
        speciesName: sn,
      } = JSON.parse(pending) as PendingChallengeShare;
      setExpandedNodes([]);
      setHighlightedKeys([]);
      setChallenge({
        mode: m,
        status: "IN_PROGRESS",
        targetSpecies: sn,
        speciesKey: sk,
        startedAt: Date.now(),
        errorTracking: { count: 0, perStep: [] },
        stepInteractions: {},
        ...(m === "DAILY" ? { challengeDate: getTodayUTC() } : {}),
      });
    }
  }, [
    isAuthenticated,
    challenge.status,
    setChallenge,
    setExpandedNodes,
    setHighlightedKeys,
  ]);

  if (challenge.mode === "DAILY" && challenge.status !== "NOT_STARTED") {
    return (
      <DailyChallengeInProgress
        key={`${challenge.speciesKey}-${challenge.replayId ?? 0}`}
      />
    );
  }

  if (challenge.mode === "RANDOM" && challenge.status !== "NOT_STARTED") {
    return (
      <RandomChallengeInProgress
        key={`${challenge.speciesKey}-${challenge.replayId ?? 0}`}
      />
    );
  }

  if (challenge.mode === "CUSTOM" && challenge.status !== "NOT_STARTED") {
    return (
      <CustomChallengeInProgress
        key={`${challenge.speciesKey}-${challenge.replayId ?? 0}`}
      />
    );
  }

  return <ChallengesLobby dayKey={dayKey} />;
};
