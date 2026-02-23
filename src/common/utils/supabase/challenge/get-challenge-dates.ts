import { supabase } from "@/common/utils/supabase/client";

export type ChallengeDate = {
  date: string;
  gbifKey: number;
  completed: boolean;
};

const getToday = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getChallengeDates = async (
  userId?: string,
): Promise<ChallengeDate[]> => {
  const today = getToday();

  const { data: challenges, error } = await supabase
    .from("daily_challenges")
    .select("date, gbif_key")
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(60);

  if (error || !challenges) return [];

  if (!userId || challenges.length === 0) {
    return challenges.map((row) => ({
      date: row.date as string,
      gbifKey: row.gbif_key as number,
      completed: false,
    }));
  }

  const gbifKeys = challenges.map((c) => c.gbif_key as number);

  const { data: completions } = await supabase
    .from("user_challenge_history")
    .select("gbif_key")
    .eq("user_id", userId)
    .eq("mode", "DAILY")
    .in("gbif_key", gbifKeys);

  const completedKeys = new Set(
    (completions ?? []).map((c) => c.gbif_key as number),
  );

  return challenges.map((row) => ({
    date: row.date as string,
    gbifKey: row.gbif_key as number,
    completed: completedKeys.has(row.gbif_key as number),
  }));
};
