import type { DbUser, FavSpecies } from "@/common/types/user";
import { supabase } from "./client";

export const updateTopFavSpecies = async (
  user: DbUser,
  updater: (prev: FavSpecies[]) => FavSpecies[],
): Promise<DbUser | null> => {
  const current = user.game_info.top_fav_species ?? [];
  const updated = updater(current);

  const updatedUser: DbUser = {
    ...user,
    game_info: { ...user.game_info, top_fav_species: updated },
  };

  void supabase
    .rpc("update_user_top_fav", { p_top_fav: updated })
    .then(({ error }) => {
      if (error) console.error("Error updating top_fav_species:", error);
    });

  return updatedUser;
};
