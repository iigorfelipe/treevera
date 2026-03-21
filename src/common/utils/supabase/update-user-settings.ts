import type { UserSettings } from "@/common/types/user";
import { supabase } from "./client";

export const updateUserSettings = async (
  settings: UserSettings,
): Promise<void> => {
  const { error } = await supabase.rpc("update_user_settings", {
    p_settings: settings,
  });

  if (error) {
    console.error("Error updating user settings:", error);
  }
};
