import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DailyChallengeCard } from "@/modules/challenge/daily/daily-challenge";
import { RandomChallengeCard } from "@/modules/challenge/random/random-challenge";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { DailyChallengeInProgress } from "../../modules/challenge/daily/daily-in-progress";
import { RandomChallengeInProgress } from "../../modules/challenge/random/random-in-progress";
import { useMidnightRefresh } from "@/hooks/use-midnight-refresh";
import { AnimatePresence, motion } from "framer-motion";

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
    return <DailyChallengeInProgress />;
  }

  if (challenge.mode === "DAILY") {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={dayKey}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <DailyChallengeCard />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (challenge.mode === "RANDOM") {
    return <RandomChallengeInProgress />;
  }

  return (
    <div className="flex flex-col gap-6 md:p-8">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={dayKey}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <DailyChallengeCard />
        </motion.div>
      </AnimatePresence>
      <RandomChallengeCard />
    </div>
  );
};
