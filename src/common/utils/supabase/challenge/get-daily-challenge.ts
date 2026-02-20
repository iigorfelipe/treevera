import { supabase } from "@/common/utils/supabase/client";

export type ChallengeData = {
  gbifKey: number;
  scientificName: string;
};

export const getDailyChallenge = async (date: string): Promise<ChallengeData | null> => {
  const { data, error } = await supabase.rpc("get_or_create_daily_challenge", {
    p_date: date,
  });

  if (error || !data || data.length === 0) {
    console.error("Error fetching daily challenge:", error);
    return null;
  }

  const row = data[0] as { gbif_key: number; scientific_name: string };
  return {
    gbifKey: row.gbif_key,
    scientificName: row.scientific_name,
  };
};
