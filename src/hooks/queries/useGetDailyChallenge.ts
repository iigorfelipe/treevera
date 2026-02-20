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

export const useGetDailyChallenge = () => {
  const { daily_challenge_key } = QUERY_KEYS;
  const today = getTodayUTC();

  return useQuery<ChallengeData | null>({
    queryKey: [daily_challenge_key, today],
    queryFn: () => getDailyChallenge(today),
    staleTime: getMsUntilMidnightUTC(),
    gcTime: getMsUntilMidnightUTC() + 1000 * 60 * 5,
  });
};
