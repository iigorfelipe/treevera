import { supabase } from "./client";

export type SpeciesCacheRow = {
  gbif_key: number;
  scientific_name: string;
  image_url: string | null;
  image_source: string | null;
  image_attribution: string | null;
  image_license: string | null;
  iucn_code: string | null;
  iucn_population_trend: string | null;
  iucn_assessment_year: number | null;
  description_pt: string | null; // TODO
  description_source: string | null;
  vernacular_names: unknown | null;
  cached_at: string;
  expires_at: string;
  family: string | null;
  has_image: boolean;
  has_iucn: boolean;
  has_description: boolean;
};

export const getSpeciesCache = async (
  gbifKey: number,
): Promise<SpeciesCacheRow | null> => {
  const { data, error } = await supabase
    .from("species_data_cache")
    .select("*")
    .eq("gbif_key", gbifKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("Error fetching species cache:", error);
    return null;
  }

  return data as SpeciesCacheRow | null;
};

export const upsertSpeciesCache = async (
  row: Omit<SpeciesCacheRow, "cached_at"> & { cached_at?: string },
): Promise<void> => {
  const { error } = await supabase.from("species_data_cache").upsert(
    {
      ...row,
      cached_at: row.cached_at ?? new Date().toISOString(),
      expires_at:
        row.expires_at ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    { onConflict: "gbif_key" },
  );

  if (error) console.error("Error upserting species cache:", error);
};

export type ImageAttribution = {
  source: string | null;
  author: string | null;
  license: string | null;
};

export const batchGetImageAttribution = async (
  gbifKeys: number[],
): Promise<Map<number, ImageAttribution>> => {
  if (gbifKeys.length === 0) return new Map();

  const { data } = await supabase
    .from("species_data_cache")
    .select("gbif_key, image_source, image_attribution, image_license")
    .in("gbif_key", gbifKeys);

  type Row = {
    gbif_key: number;
    image_source: string | null;
    image_attribution: string | null;
    image_license: string | null;
  };

  return new Map(
    ((data as Row[]) ?? []).map((r) => [
      r.gbif_key,
      { source: r.image_source, author: r.image_attribution, license: r.image_license },
    ]),
  );
};

