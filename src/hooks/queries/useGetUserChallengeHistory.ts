import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { fetchUserChallengeHistory } from "@/common/utils/supabase/user-challenge-history";
import { QUERY_KEYS } from "./keys";

export const useGetUserChallengeHistory = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.user_challenge_history_key, userId],
    queryFn: () => fetchUserChallengeHistory(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
