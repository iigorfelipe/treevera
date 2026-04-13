import { supabase } from "@/common/utils/supabase/client";

export const deactivateChallengeSpecies = async (
  gbifKey: number,
): Promise<void> => {
  const { error } = await supabase.rpc("deactivate_challenge_species", {
    p_gbif_key: gbifKey,
  });

  if (error) {
    console.error("Error deactivating challenge species:", error);
  }
};
