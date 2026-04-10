import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { DailyChallengeInProgress } from "../../modules/challenge/daily/daily-in-progress";
import { RandomChallengeInProgress } from "../../modules/challenge/random/random-in-progress";
import { CustomChallengeInProgress } from "../../modules/challenge/custom/custom-challenge-in-progress";
import { ChallengesLobby } from "@/modules/challenge/lobby";
import { useMidnightRefresh } from "@/hooks/use-midnight-refresh";

const getTodayKey = () => new Date().toDateString();

export const Challenges = () => {
  const challenge = useAtomValue(treeAtom.challenge);
  const queryClient = useQueryClient();
  const [dayKey, setDayKey] = useState(getTodayKey);

  useMidnightRefresh(() => {
    void queryClient.invalidateQueries({ queryKey: ["challenge_dates"] });
    setDayKey(getTodayKey());
  });

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
