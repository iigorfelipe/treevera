import { supabase } from "./client";

export type UserSeenSpeciesRow = {
  user_id: string;
  gbif_key: number;
  seen_at: string;
  is_favorite: boolean;
};

export const fetchSeenSpecies = async (
  userId: string,
): Promise<UserSeenSpeciesRow[]> => {
  const { data, error } = await supabase
    .from("user_seen_species")
    .select("*")
    .eq("user_id", userId)
    .order("seen_at", { ascending: false });

  if (error) {
    console.error("Error fetching seen species:", error);
    return [];
  }

  return (data as UserSeenSpeciesRow[]) ?? [];
};

export const addSeenSpecie = async (
  userId: string,
  gbifKey: number,
): Promise<void> => {
  const { error } = await supabase.from("user_seen_species").upsert(
    {
      user_id: userId,
      gbif_key: gbifKey,
      seen_at: new Date().toISOString(),
      is_favorite: false,
    },
    { onConflict: "user_id,gbif_key", ignoreDuplicates: true },
  );

  if (error) console.error("Error adding seen specie:", error);
};

export const toggleFavSpecie = async (
  userId: string,
  gbifKey: number,
  isFavorite: boolean,
): Promise<void> => {
  const { error } = await supabase.from("user_seen_species").upsert(
    {
      user_id: userId,
      gbif_key: gbifKey,
      seen_at: new Date().toISOString(),
      is_favorite: isFavorite,
    },
    { onConflict: "user_id,gbif_key" },
  );

  if (error) console.error("Error toggling fav specie:", error);
};
