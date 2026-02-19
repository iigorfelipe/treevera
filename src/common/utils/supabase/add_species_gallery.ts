import type { DbUser, SeenSpecies } from "@/common/types/user";
import { supabase } from "./client";

export const updateSeenSpecies = async (
  user: DbUser,
  updater: (prev: SeenSpecies[]) => SeenSpecies[],
) => {
  try {
    const currentSpecies = user.game_info?.seen_species ?? [];

    const newSeenSpecies = updater(currentSpecies);

    const { data, error } = await supabase
      .from("users")
      .update({
        game_info: {
          ...user.game_info,
          seen_species: newSeenSpecies,
        },
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating seen_species:", error);
      return null;
    }

    return data as DbUser;
  } catch (e) {
    console.error("Unexpected error updating seen_species:", e);
    return null;
  }
};
