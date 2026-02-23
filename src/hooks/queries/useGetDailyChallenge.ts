import { useQuery } from "@tanstack/react-query";
import { getDailyChallenge } from "@/common/utils/supabase/challenge/get-daily-challenge";
import type { ChallengeData } from "@/common/utils/supabase/challenge/get-daily-challenge";
import { QUERY_KEYS } from "./keys";

const getToday = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getMsUntilMidnight = () => {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - Date.now();
};

export const useGetDailyChallenge = (date?: string) => {
  const { daily_challenge_key } = QUERY_KEYS;
  const today = getToday();
  const targetDate = date ?? today;
  const isToday = targetDate === today;

  return useQuery<ChallengeData | null>({
    queryKey: [daily_challenge_key, targetDate],
    queryFn: () => getDailyChallenge(targetDate),
    staleTime: isToday ? getMsUntilMidnight() : Infinity,
    gcTime: isToday
      ? getMsUntilMidnight() + 1000 * 60 * 5
      : 1000 * 60 * 60 * 24,
  });
};
