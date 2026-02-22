import { DailyChallengeCard } from "@/modules/challenge/daily/daily-challenge";
import { RandomChallengeCard } from "@/modules/challenge/random/random-challenge";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { DailyChallengeInProgress } from "../../modules/challenge/daily/daily-in-progress";
import { RandomChallengeInProgress } from "../../modules/challenge/random/random-in-progress";

export const Challenges = () => {
  const challenge = useAtomValue(treeAtom.challenge);

  if (challenge.mode === "DAILY" && challenge.status !== "NOT_STARTED") {
    return <DailyChallengeInProgress />;
  }
  if (challenge.mode === "DAILY") {
    return <DailyChallengeCard />;
  }
  if (challenge.mode === "RANDOM") {
    return <RandomChallengeInProgress />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <DailyChallengeCard />
      <RandomChallengeCard />
    </div>
  );
};
