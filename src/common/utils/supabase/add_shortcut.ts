import type { DbUser } from "@/common/types/user";
import { supabase } from "./client";

export const updateUserShortcut = async (
  user: DbUser,
  updater: (
    prev: DbUser["game_info"]["shortcuts"],
  ) => DbUser["game_info"]["shortcuts"],
) => {
  try {
    const newShortcuts = updater(user.game_info.shortcuts);
    const { data, error } = await supabase
      .from("users")
      .update({ game_info: { ...user.game_info, shortcuts: newShortcuts } })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating shortcuts:", error);
      return null;
    }

    return data as DbUser;
  } catch (e) {
    console.error("Unexpected error updating shortcuts:", e);
    return null;
  }
};
