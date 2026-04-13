import { supabase } from "../client";

export type RecentChallenge = {
  id: number;
  gbif_key: number | null;
  species_name: string | null;
  mode: string;
  challenge_date: string;
  completed_at: string;
};

export const getRecentChallenges = async (
  userId: string,
  limit = 10,
): Promise<RecentChallenge[]> => {
  const { data, error } = await supabase
    .from("user_challenge_history")
    .select("id, gbif_key, species_name, mode, challenge_date, completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentChallenges:", error);
    return [];
  }

  return (data as RecentChallenge[]) ?? [];
};
