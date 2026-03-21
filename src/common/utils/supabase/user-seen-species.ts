import { supabase } from "./client";

export type UserSeenSpeciesRow = {
  user_id: string;
  gbif_key: number;
  seen_at: string;
  is_favorite: boolean;
  kingdom: string | null;
  iucn_status: string | null;
  preferred_image_url: string | null;
  canonical_name: string | null;
  family: string | null;
};

export const fetchSeenSpecies = async (
  userId: string,
  limit?: number,
): Promise<UserSeenSpeciesRow[]> => {
  let query = supabase
    .from("user_seen_species")
    .select("*")
    .eq("user_id", userId)
    .order("seen_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching seen species:", error);
    return [];
  }

  return (data as UserSeenSpeciesRow[]) ?? [];
};

export const fetchSeenSpecieByKey = async (
  userId: string,
  gbifKey: number,
): Promise<UserSeenSpeciesRow | null> => {
  const { data, error } = await supabase
    .from("user_seen_species")
    .select("*")
    .eq("user_id", userId)
    .eq("gbif_key", gbifKey)
    .maybeSingle();

  if (error) {
    console.error("Error fetching seen specie by key:", error);
    return null;
  }

  return data as UserSeenSpeciesRow | null;
};

export type GallerySpeciesRow = {
  gbif_key: number;
  canonical_name: string | null;
  family: string | null;
  image_url: string | null;
  is_favorite: boolean;
  seen_at: string;
  total_count: number;
};

export type FetchSeenSpeciesPageOptions = {
  favoritesOnly?: boolean;
  sortOrder?: "newest" | "oldest";
  photosFirst?: boolean;
  search?: string;
};

export type GalleryPage = {
  rows: GallerySpeciesRow[];
  totalCount: number;
};

export const fetchGalleryPage = async (
  userId: string,
  page: number,
  pageSize: number,
  options: FetchSeenSpeciesPageOptions = {},
): Promise<GalleryPage> => {
  const {
    favoritesOnly = false,
    sortOrder = "newest",
    photosFirst = true,
    search,
  } = options;

  const { data, error } = await supabase.rpc("get_gallery_species", {
    p_user_id: userId,
    p_limit: pageSize,
    p_offset: page * pageSize,
    p_favorites: favoritesOnly,
    p_sort_asc: sortOrder === "oldest",
    p_photos_first: photosFirst,
    ...(search ? { p_search: search } : {}),
  });

  if (error) {
    console.error("Error fetching gallery page:", error);
    return { rows: [], totalCount: 0 };
  }

  const rows = (data as GallerySpeciesRow[]) ?? [];
  return {
    rows,
    totalCount: rows[0]?.total_count ?? 0,
  };
};

export const addSeenSpecie = async (
  userId: string,
  gbifKey: number,
  kingdom?: string,
  canonicalName?: string,
  family?: string,
): Promise<void> => {
  const { error } = await supabase.from("user_seen_species").upsert(
    {
      user_id: userId,
      gbif_key: gbifKey,
      seen_at: new Date().toISOString(),
      is_favorite: false,
      kingdom: kingdom ?? null,
      canonical_name: canonicalName ?? null,
      family: family ?? null,
    },
    { onConflict: "user_id,gbif_key", ignoreDuplicates: true },
  );

  if (error) {
    console.error("Error adding seen specie:", error);
    return;
  }

  if (canonicalName || family) {
    void supabase
      .from("user_seen_species")
      .update({
        ...(canonicalName ? { canonical_name: canonicalName } : {}),
        ...(family ? { family } : {}),
      })
      .eq("user_id", userId)
      .eq("gbif_key", gbifKey)
      .is("canonical_name", null)
      .then(({ error: err }) => {
        if (err) console.error("Error backfilling species metadata:", err);
      });
  }
};

export const toggleFavSpecie = async (
  userId: string,
  gbifKey: number,
  isFavorite: boolean,
  preferredImageUrl?: string | null,
): Promise<void> => {
  const payload: Partial<UserSeenSpeciesRow> & {
    user_id: string;
    gbif_key: number;
    seen_at: string;
    is_favorite: boolean;
  } = {
    user_id: userId,
    gbif_key: gbifKey,
    seen_at: new Date().toISOString(),
    is_favorite: isFavorite,
  };

  if (preferredImageUrl !== undefined) {
    payload.preferred_image_url = preferredImageUrl;
  }

  const { error } = await supabase
    .from("user_seen_species")
    .upsert(payload, { onConflict: "user_id,gbif_key" });

  if (error) console.error("Error toggling fav specie:", error);
};

export const clearBrokenImage = async (gbifKey: number): Promise<void> => {
  const { error } = await supabase
    .from("species_data_cache")
    .update({ has_image: false, image_url: null })
    .eq("gbif_key", gbifKey);

  if (error) console.error("Error clearing broken image:", error);
};

export const updateSeenSpeciesIucn = async (
  userId: string,
  gbifKey: number,
  iucnStatus: string,
): Promise<void> => {
  const { error } = await supabase
    .from("user_seen_species")
    .update({ iucn_status: iucnStatus })
    .eq("user_id", userId)
    .eq("gbif_key", gbifKey);

  if (error) console.error("Error updating iucn_status:", error);
};
