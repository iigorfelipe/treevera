import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { getRecentChallenges } from "@/common/utils/supabase/challenge/get-recent-challenges";
import { QUERY_KEYS } from "./keys";

export const useGetRecentChallenges = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.user_challenge_history_key, userId, "recent"],
    queryFn: () => getRecentChallenges(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};
