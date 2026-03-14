import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { fetchSeenSpecies } from "@/common/utils/supabase/user-seen-species";
import { QUERY_KEYS } from "./keys";

export const useGetUserSeenSpecies = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.user_seen_species_key, userId],
    queryFn: () => fetchSeenSpecies(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 60 * 24, // 24h
  });
};
