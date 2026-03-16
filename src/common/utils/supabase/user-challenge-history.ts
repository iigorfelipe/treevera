import { supabase } from "./client";

export type UserChallengeHistoryRow = {
  mode: string;
  challenge_date: string;
};

export const fetchUserChallengeHistory = async (
  userId: string,
): Promise<UserChallengeHistoryRow[]> => {
  const { data, error } = await supabase
    .from("user_challenge_history")
    .select("mode, challenge_date")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching challenge history:", error);
    return [];
  }

  return (data as UserChallengeHistoryRow[]) ?? [];
};
