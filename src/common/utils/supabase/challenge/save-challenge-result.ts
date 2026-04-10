import { supabase } from "@/common/utils/supabase/client";

type SaveChallengeResultParams = {
  userId: string;
  gbifKey: number;
  mode: "DAILY" | "RANDOM" | "CUSTOM";
  speciesName: string;
  challengeDate: string; // 'YYYY-MM-DD'
};

export const saveChallengeResult = async ({
  userId,
  gbifKey,
  mode,
  speciesName,
  challengeDate,
}: SaveChallengeResultParams): Promise<{ wasNew: boolean }> => {
  const { data, error } = await supabase
    .from("user_challenge_history")
    .upsert(
      {
        user_id: userId,
        gbif_key: gbifKey,
        mode,
        species_name: speciesName,
        challenge_date: challengeDate,
      },
      { onConflict: "user_id,gbif_key,mode", ignoreDuplicates: true },
    )
    .select();

  if (error) {
    console.error("Error saving challenge result:", error);
    return { wasNew: false };
  }

  return { wasNew: data != null && data.length > 0 };
};
