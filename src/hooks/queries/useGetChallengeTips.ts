import { useQuery } from "@tanstack/react-query";
import { getChallengeTips } from "@/common/utils/supabase/challenge/get-challenge-tips";
import type { TipsMap } from "@/common/utils/supabase/challenge/get-challenge-tips";
import { QUERY_KEYS } from "./keys";
import type { Rank } from "@/common/types/api";

type PathNode = { rank: Rank; name: string };

export const useGetChallengeTips = (correctPath: PathNode[]) => {
  const canonicalNames = correctPath.map((n) => n.name);

  return useQuery<TipsMap>({
    queryKey: [QUERY_KEYS.challenge_tips_key, ...canonicalNames],
    queryFn: async () => {
      return await getChallengeTips(canonicalNames);
    },
    enabled: canonicalNames.length > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};
