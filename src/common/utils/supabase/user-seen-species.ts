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

export type FavoriteSpeciesPage = {
  rows: UserSeenSpeciesRow[];
  totalCount: number;
};

export const fetchFavoriteSpeciesPage = async (
  userId: string,
  page: number,
  pageSize: number,
): Promise<FavoriteSpeciesPage> => {
  const { data, error, count } = await supabase
    .from("user_seen_species")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .order("seen_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching favorite species page:", error);
    return { rows: [], totalCount: 0 };
  }

  const rows = (data as UserSeenSpeciesRow[]) ?? [];

  const keysWithoutImage = rows
    .filter((r) => !r.preferred_image_url)
    .map((r) => r.gbif_key);

  if (keysWithoutImage.length > 0) {
    const { data: cacheRows } = await supabase
      .from("species_data_cache")
      .select("gbif_key, image_url")
      .in("gbif_key", keysWithoutImage)
      .eq("has_image", true);

    if (cacheRows) {
      const cacheMap = new Map(
        (cacheRows as { gbif_key: number; image_url: string | null }[]).map(
          (r) => [r.gbif_key, r.image_url],
        ),
      );
      for (const row of rows) {
        if (!row.preferred_image_url && cacheMap.has(row.gbif_key)) {
          row.preferred_image_url = cacheMap.get(row.gbif_key) ?? null;
        }
      }
    }
  }

  return {
    rows,
    totalCount: count ?? 0,
  };
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
  metadata?: {
    canonicalName?: string | null;
    family?: string | null;
    kingdom?: string | null;
  },
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

  if (metadata?.canonicalName) {
    payload.canonical_name = metadata.canonicalName;
  }
  if (metadata?.family) {
    payload.family = metadata.family;
  }
  if (metadata?.kingdom) {
    payload.kingdom = metadata.kingdom;
  }

  const { error } = await supabase
    .from("user_seen_species")
    .upsert(payload, { onConflict: "user_id,gbif_key" });

  if (error) console.error("Error toggling fav specie:", error);
};

export const updatePreferredImage = async (
  userId: string,
  gbifKey: number,
  imageUrl: string,
  metadata?: { canonicalName?: string | null; family?: string | null },
): Promise<void> => {
  const { error } = await supabase.from("user_seen_species").upsert(
    {
      user_id: userId,
      gbif_key: gbifKey,
      seen_at: new Date().toISOString(),
      preferred_image_url: imageUrl,
      ...(metadata?.canonicalName
        ? { canonical_name: metadata.canonicalName }
        : {}),
      ...(metadata?.family ? { family: metadata.family } : {}),
    },
    { onConflict: "user_id,gbif_key" },
  );
  if (error) console.error("Error updating preferred image:", error);
};

export const clearBrokenImage = async (gbifKey: number): Promise<void> => {
  const { error } = await supabase
    .from("species_data_cache")
    .update({ has_image: false, image_url: null })
    .eq("gbif_key", gbifKey);

  if (error) console.error("Error clearing broken image:", error);
};

export type SpeciesFavoriter = {
  user_id: string;
  user_name: string;
  user_username: string;
  user_avatar_url: string | null;
};

export const fetchSpeciesFavCount = async (
  gbifKey: number,
): Promise<number> => {
  const { data, error } = await supabase.rpc("get_species_fav_count", {
    p_gbif_key: gbifKey,
  });
  if (error) {
    console.error("Error fetching species fav count:", error);
    return 0;
  }
  return (data as number) ?? 0;
};

export const fetchSpeciesFavoriters = async (
  gbifKey: number,
): Promise<SpeciesFavoriter[]> => {
  const { data, error } = await supabase.rpc("get_species_favoriters", {
    p_gbif_key: gbifKey,
  });
  if (error) {
    console.error("Error fetching species favoriters:", error);
    return [];
  }
  return (data as SpeciesFavoriter[]) ?? [];
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
