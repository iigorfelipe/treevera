import type { DbUser, FavSpecies } from "@/common/types/user";
import { supabase } from "./client";

export const updateTopFavSpecies = async (
  user: DbUser,
  updater: (prev: FavSpecies[]) => FavSpecies[],
) => {
  try {
    const current = user.game_info.top_fav_species ?? [];
    const updated = updater(current);

    const { data, error } = await supabase
      .from("users")
      .update({
        game_info: {
          ...user.game_info,
          top_fav_species: updated,
        },
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating top_fav_species:", error);
      return null;
    }

    return data as DbUser;
  } catch (e) {
    console.error("Unexpected error updating top_fav_species:", e);
    return null;
  }
};
