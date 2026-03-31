import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { fetchActivities } from "@/common/utils/supabase/user-activities";
import { supabase } from "@/common/utils/supabase/client";
import { QUERY_KEYS } from "./keys";

export const useGetUserActivities = (limit = 20, userId?: string) => {
  const session = useAtomValue(authStore.session);
  const sessionUserId = session?.user?.id;
  const targetUserId = userId ?? sessionUserId;

  return useQuery({
    queryKey: [QUERY_KEYS.user_activities_key, targetUserId, limit],
    queryFn: async () => {
      if (userId) {
        const { data, error } = await supabase.rpc("get_public_activities", {
          p_user_id: userId,
          p_limit: limit,
        });
        if (error) throw error;
        return (data ?? []) as Awaited<ReturnType<typeof fetchActivities>>;
      }
      return fetchActivities(sessionUserId!, limit);
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
