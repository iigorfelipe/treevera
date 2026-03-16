import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { fetchUserAchievements } from "@/common/utils/supabase/user-achievements";
import { QUERY_KEYS } from "./keys";

export const useGetUserAchievements = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.user_achievements_key, userId],
    queryFn: () => fetchUserAchievements(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};
