import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { getChallengeStats } from "@/common/utils/supabase/challenge/get-challenge-stats";
import { QUERY_KEYS } from "./keys";

export const useGetChallengeStats = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.challenge_stats_key, userId],
    queryFn: () => getChallengeStats(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
