import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { fetchActivities } from "@/common/utils/supabase/user-activities";
import { QUERY_KEYS } from "./keys";

export const useGetUserActivities = (limit = 20) => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.user_activities_key, userId, limit],
    queryFn: () => fetchActivities(userId!, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 60 * 24, // 24h
  });
};
