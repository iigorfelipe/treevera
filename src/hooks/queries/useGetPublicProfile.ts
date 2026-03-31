import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/common/utils/supabase/client";
import type { PublicProfile } from "@/common/types/user";
import { QUERY_KEYS } from "./keys";

export function useGetPublicProfile(username: string | undefined) {
  return useQuery<PublicProfile | null>({
    queryKey: [QUERY_KEYS.public_profile_key, username?.toLowerCase()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_profile", {
        p_username: username!,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data[0] as PublicProfile;
    },
    enabled: !!username,
    staleTime: 5 * 60_000,
  });
}
