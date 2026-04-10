import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { getUserCustomChallenges } from "@/common/utils/supabase/challenge/custom-challenges";
import { QUERY_KEYS } from "./keys";

export const useGetUserCustomChallenges = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.user_custom_challenges_key, userId],
    queryFn: () => getUserCustomChallenges(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
