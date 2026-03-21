import { supabase } from "./client";

export type UserAchievementRow = {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
};

export const fetchUserAchievements = async (
  userId: string,
): Promise<UserAchievementRow[]> => {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: true });

  if (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }

  return (data as UserAchievementRow[]) ?? [];
};

export type AchievementProgressRow = {
  id: string;
  progress: number;
};

export const fetchAchievementProgress = async (
  userId: string,
): Promise<AchievementProgressRow[]> => {
  const { data, error } = await supabase.rpc("get_achievement_progress", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching achievement progress:", error);
    return [];
  }

  return (data as AchievementProgressRow[]) ?? [];
};

export const checkAndUnlockAchievements = async (
  userId: string,
): Promise<string[]> => {
  const { data, error } = await supabase.rpc("check_and_unlock_achievements", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error checking achievements:", error);
    return [];
  }

  return ((data as { achievement_id: string }[]) ?? []).map(
    (r) => r.achievement_id,
  );
};
