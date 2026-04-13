import { supabase } from "@/common/utils/supabase/client";

export type ChallengeStats = {
  dailyCount: number;
  randomCount: number;
  avgAccuracy: number | null;
  speciesDiscovered: number;
};

export const getChallengeStats = async (
  userId: string,
): Promise<ChallengeStats> => {
  const { data, error } = await supabase.rpc("get_challenge_stats", {
    p_user_id: userId,
  });

  if (error || !data) {
    return {
      dailyCount: 0,
      randomCount: 0,
      avgAccuracy: null,
      speciesDiscovered: 0,
    };
  }

  return {
    dailyCount: data.daily_count ?? 0,
    randomCount: data.random_count ?? 0,
    avgAccuracy: data.avg_accuracy ?? null,
    speciesDiscovered: data.species_discovered ?? 0,
  };
};
