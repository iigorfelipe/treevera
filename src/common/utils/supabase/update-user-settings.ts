import type { DbUser, UserSettings } from "@/common/types/user";
import { supabase } from "./client";

export const updateUserSettings = async (
  user: DbUser,
  settings: UserSettings,
): Promise<DbUser | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ game_info: { ...user.game_info, settings } })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user settings:", error);
      return null;
    }

    return data as DbUser;
  } catch (e) {
    console.error("Unexpected error updating user settings:", e);
    return null;
  }
};
