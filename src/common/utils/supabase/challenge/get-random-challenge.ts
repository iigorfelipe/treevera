import { supabase } from "@/common/utils/supabase/client";
import type { ChallengeData } from "./get-daily-challenge";

export const getRandomChallengeForUser = async (userId: string): Promise<ChallengeData | null> => {
  const { data, error } = await supabase.rpc("get_random_challenge_for_user", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching random challenge:", error);
    return null;
  }

  if (!data || data.length === 0) return null;

  const row = data[0] as { gbif_key: number; scientific_name: string };
  return {
    gbifKey: row.gbif_key,
    scientificName: row.scientific_name,
  };
};
