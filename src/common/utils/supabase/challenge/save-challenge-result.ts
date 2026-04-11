import { supabase } from "@/common/utils/supabase/client";

type SaveChallengeResultParams = {
  userId: string;
  gbifKey: number;
  mode: "DAILY" | "RANDOM" | "CUSTOM";
  speciesName: string;
  challengeDate: string;
  elapsedSeconds?: number;
  errorCount?: number;
  correctSteps?: number;
  totalSteps?: number;
};

export const saveChallengeResult = async ({
  userId,
  gbifKey,
  mode,
  speciesName,
  challengeDate,
  elapsedSeconds,
  errorCount,
  correctSteps,
  totalSteps,
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
        ...(elapsedSeconds !== undefined && {
          elapsed_seconds: elapsedSeconds,
        }),
        ...(errorCount !== undefined && { error_count: errorCount }),
        ...(correctSteps !== undefined && { correct_steps: correctSteps }),
        ...(totalSteps !== undefined && { total_steps: totalSteps }),
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
