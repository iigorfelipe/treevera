import type { DbUser, Shortcuts } from "@/common/types/user";
import { supabase } from "./client";

export const updateUserShortcut = async (
  user: DbUser,
  updater: (prev: Shortcuts) => Shortcuts,
): Promise<DbUser | null> => {
  const currentShortcuts = user.game_info.shortcuts ?? ({} as Shortcuts);
  const newShortcuts = updater(currentShortcuts);

  const updatedUser: DbUser = {
    ...user,
    game_info: { ...user.game_info, shortcuts: newShortcuts },
  };

  const { error } = await supabase.rpc("update_user_shortcuts", {
    p_shortcuts: newShortcuts,
  });

  if (error) console.error("Error updating shortcuts:", error);

  return updatedUser;
};
