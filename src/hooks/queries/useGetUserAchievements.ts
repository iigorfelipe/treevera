import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import {
  fetchUserAchievements,
  fetchAchievementProgress,
  type UserAchievementRow,
} from "@/common/utils/supabase/user-achievements";
import { supabase } from "@/common/utils/supabase/client";
import { QUERY_KEYS } from "./keys";

export const useGetUserAchievements = (userId?: string) => {
  const session = useAtomValue(authStore.session);
  const sessionUserId = session?.user?.id;
  const targetUserId = userId ?? sessionUserId;

  return useQuery({
    queryKey: [QUERY_KEYS.user_achievements_key, targetUserId],
    queryFn: async () => {
      if (userId) {
        const { data, error } = await supabase.rpc("get_public_achievements", {
          p_user_id: userId,
        });
        if (error) throw error;
        return (data ?? []) as UserAchievementRow[];
      }
      return fetchUserAchievements(sessionUserId!);
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAchievementProgress = (userId?: string) => {
  const session = useAtomValue(authStore.session);
  const sessionUserId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.achievement_progress_key, sessionUserId],
    queryFn: () => fetchAchievementProgress(sessionUserId!),
    enabled: !userId && !!sessionUserId,
    staleTime: 1000 * 60 * 5,
  });
};
