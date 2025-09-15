import type { DbUser, Species_book } from "@/common/types/user";
import { supabase } from "./client";

export const updateUserSpeciesBook = async (
  user: DbUser,
  updater: (prev: Species_book[]) => Species_book[],
) => {
  try {
    const currentSpecies = user.game_info?.species_book ?? [];

    const newSpeciesBook = updater(currentSpecies);
    const { data, error } = await supabase
      .from("users")
      .update({
        game_info: { ...user.game_info, species_book: newSpeciesBook },
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating species_book:", error);
      return null;
    }

    return data as DbUser;
  } catch (e) {
    console.error("Unexpected error updating species_book:", e);
    return null;
  }
};
