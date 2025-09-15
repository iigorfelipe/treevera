import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../keys";
import { fetchUser } from "@/common/utils/supabase/fetch-user";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth";

export const useGetUserDb = () => {
  const session = useAtomValue(authStore.session);

  return useQuery({
    queryKey: [QUERY_KEYS.user_db_key, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      return await fetchUser(session.user.id);
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 60 * 24, // 24h
  });
};
