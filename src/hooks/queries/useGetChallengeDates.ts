import { useQuery } from "@tanstack/react-query";
import { getChallengeDates } from "@/common/utils/supabase/challenge/get-challenge-dates";
import type { ChallengeDate } from "@/common/utils/supabase/challenge/get-challenge-dates";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";

export type { ChallengeDate };

export const useGetChallengeDates = () => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery<ChallengeDate[]>({
    queryKey: ["challenge_dates", userId ?? "anonymous"],
    queryFn: () => getChallengeDates(userId),
    staleTime: 1000 * 60 * 5,
  });
};
