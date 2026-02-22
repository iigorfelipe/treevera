import { useQuery } from "@tanstack/react-query";
import { getDailyChallenge } from "@/common/utils/supabase/challenge/get-daily-challenge";
import type { ChallengeData } from "@/common/utils/supabase/challenge/get-daily-challenge";
import { QUERY_KEYS } from "./keys";

const getTodayUTC = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

const getMsUntilMidnightUTC = () => {
  const now = new Date();
  const midnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return midnight.getTime() - now.getTime();
};

export const useGetDailyChallenge = (date?: string) => {
  const { daily_challenge_key } = QUERY_KEYS;
  const today = getTodayUTC();
  const targetDate = date ?? today;
  const isToday = targetDate === today;

  return useQuery<ChallengeData | null>({
    queryKey: [daily_challenge_key, targetDate],
    queryFn: () => getDailyChallenge(targetDate),
    staleTime: isToday ? getMsUntilMidnightUTC() : Infinity,
    gcTime: isToday
      ? getMsUntilMidnightUTC() + 1000 * 60 * 5
      : 1000 * 60 * 60 * 24,
  });
};
