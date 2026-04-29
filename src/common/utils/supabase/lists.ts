import { supabase } from "./client";
import { slugify } from "@/common/utils/slugify";
import type {
  ListWithCreator,
  ListPreview,
  ListPreviewWithCreator,
  ListLikedPreview,
  ListSpeciesRow,
  ListPickerItem,
  ToggleLikeResult,
  ListLiker,
} from "@/common/types/lists";

export async function fetchFeaturedLists(): Promise<ListWithCreator[]> {
  try {
    const { data, error } = await supabase.rpc("get_featured_lists");
    if (error) throw error;
    return (data as ListWithCreator[]) ?? [];
  } catch (err) {
    console.error("fetchFeaturedLists:", err);
    return [];
  }
}

export async function setFeaturedLists(listIds: string[]): Promise<void> {
  const { error } = await supabase.rpc("set_featured_lists", {
    list_ids: listIds,
  });
  if (error) throw error;
}

export async function fetchPublicLists(
  limit: number,
  offset: number,
  sort: "recent" | "popular",
  search?: string,
): Promise<{ rows: ListWithCreator[]; totalCount: number }> {
  try {
    const { data, error } = await supabase.rpc("get_public_lists", {
      p_limit: limit,
      p_offset: offset,
      p_sort: sort,
      p_search: search || null,
    });

    if (error) throw error;
    if (!data || data.length === 0) return { rows: [], totalCount: 0 };

    return {
      rows: data as ListWithCreator[],
      totalCount: (data[0] as ListWithCreator).total_count,
    };
  } catch (err) {
    console.error("fetchPublicLists:", err);
    return { rows: [], totalCount: 0 };
  }
}

export async function fetchUserLists(
  userId: string,
  limit: number,
  offset = 0,
): Promise<{ rows: ListPreview[]; totalCount: number }> {
  try {
    const { data, error } = await supabase.rpc("get_user_lists", {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;
    if (!data || data.length === 0) return { rows: [], totalCount: 0 };

    return {
      rows: data as ListPreview[],
      totalCount: (data[0] as ListPreview).total_count,
    };
  } catch (err) {
    console.error("fetchUserLists:", err);
    return { rows: [], totalCount: 0 };
  }
}

export async function fetchUserLikedLists(
  userId: string,
  limit: number,
  offset = 0,
): Promise<{ rows: ListLikedPreview[]; totalCount: number }> {
  try {
    const { data, error } = await supabase.rpc("get_user_liked_lists", {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;
    if (!data || data.length === 0) return { rows: [], totalCount: 0 };

    return {
      rows: data as ListLikedPreview[],
      totalCount: (data[0] as ListLikedPreview).total_count,
    };
  } catch (err) {
    console.error("fetchUserLikedLists:", err);
    return { rows: [], totalCount: 0 };
  }
}
export async function fetchListDetail(
  username: string,
  slug: string,
): Promise<ListWithCreator | null> {
  const detail = await fetchListDetailByStoredSlug(username, slug);
  if (detail) return detail;

  const search = slug.replace(/-/g, " ").trim();
  if (!search) return null;

  const { rows } = await fetchPublicLists(20, 0, "recent", search);
  const candidate = rows.find(
    (list) => list.user_username === username && slugify(list.title) === slug,
  );

  if (!candidate?.slug || candidate.slug === slug) return null;

  return fetchListDetailByStoredSlug(username, candidate.slug);
}

async function fetchListDetailByStoredSlug(
  username: string,
  slug: string,
): Promise<ListWithCreator | null> {
  try {
    const { data, error } = await supabase.rpc("get_list_detail_by_slug", {
      p_username: username,
      p_slug: slug,
    });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data[0] as ListWithCreator;
  } catch (err) {
    console.error("fetchListDetail:", err);
    return null;
  }
}

export async function fetchListSpecies(
  listId: string,
  limit: number,
  offset: number,
): Promise<{ rows: ListSpeciesRow[]; totalCount: number }> {
  try {
    const { data, error } = await supabase.rpc("get_list_species", {
      p_list_id: listId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;
    if (!data || data.length === 0) return { rows: [], totalCount: 0 };

    const rows = data as ListSpeciesRow[];

    return {
      rows,
      totalCount: rows[0].total_count,
    };
  } catch (err) {
    console.error("fetchListSpecies:", err);
    return { rows: [], totalCount: 0 };
  }
}
export async function fetchUserSeenInList(
  listId: string,
): Promise<Set<number>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return new Set();

    const { data, error } = await supabase.rpc("get_user_seen_in_list", {
      p_list_id: listId,
    });

    if (error) throw error;
    return new Set((data as { gbif_key: number }[]).map((r) => r.gbif_key));
  } catch (err) {
    console.error("fetchUserSeenInList:", err);
    return new Set();
  }
}
export async function toggleListLike(
  listId: string,
): Promise<ToggleLikeResult | null> {
  try {
    const { data, error } = await supabase.rpc("toggle_list_like", {
      p_list_id: listId,
    });

    if (error) throw error;
    return data as ToggleLikeResult;
  } catch (err) {
    console.error("❌ toggleListLike:", err);
    return null;
  }
}

export async function fetchListLikers(
  username: string,
  slug: string,
): Promise<ListLiker[]> {
  const page = await fetchListLikersPage(username, slug, 50, 0);
  return page.rows;
}

export type ListLikersPage = {
  rows: ListLiker[];
  totalCount: number;
};

export async function fetchListLikersPage(
  username: string,
  slug: string,
  limit: number,
  offset: number,
): Promise<ListLikersPage> {
  try {
    const detail = await fetchListDetail(username, slug);
    const storedSlug = detail?.slug ?? slug;
    const { data, error } = await supabase.rpc("get_list_likers", {
      p_username: username,
      p_slug: storedSlug,
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw error;
    const rows = (data as ListLiker[]) ?? [];
    return {
      rows,
      totalCount: rows[0]?.total_count ?? 0,
    };
  } catch (err) {
    console.error("fetchListLikers:", err);
    return { rows: [], totalCount: 0 };
  }
}
export async function createList(
  title: string,
  description?: string,
  isPublic = true,
): Promise<{ id: string } | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("lists")
      .insert({
        user_id: session.user.id,
        title,
        slug: slugify(title),
        description: description || null,
        is_public: isPublic,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("createList:", err);
    return null;
  }
}

export async function updateList(
  listId: string,
  updates: { title?: string; description?: string; is_public?: boolean },
): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.title) {
      payload.slug = slugify(updates.title);
    }

    const { error } = await supabase
      .from("lists")
      .update(payload)
      .eq("id", listId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateList:", err);
    return false;
  }
}
export async function setListCoverImage(
  listId: string,
  imageUrl: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("lists")
      .update({ cover_image_url: imageUrl })
      .eq("id", listId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("setListCoverImage:", err);
    return false;
  }
}

export async function deleteList(listId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("lists").delete().eq("id", listId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteList:", err);
    return false;
  }
}

export async function addSpeciesToList(
  listId: string,
  gbifKey: number,
  image?: {
    url?: string | null;
    source?: string | null;
    author?: string | null;
    license?: string | null;
  },
): Promise<{ species_count: number } | null> {
  try {
    const { data, error } = await supabase.rpc("add_species_to_list", {
      p_list_id: listId,
      p_gbif_key: gbifKey,
      p_image_url: image?.url ?? null,
      p_image_source: image?.source ?? null,
      p_image_attribution: image?.author ?? null,
      p_image_license: image?.license ?? null,
    });

    if (error) throw error;
    return data as { species_count: number };
  } catch (err) {
    console.error("addSpeciesToList:", err);
    return null;
  }
}

export async function updateListSpeciesImage(
  listId: string,
  gbifKey: number,
  imageUrl: string,
  image?: {
    source?: string | null;
    author?: string | null;
    license?: string | null;
  },
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("update_list_species_image", {
      p_list_id: listId,
      p_gbif_key: gbifKey,
      p_image_url: imageUrl,
      p_image_source: image?.source ?? null,
      p_image_attribution: image?.author ?? null,
      p_image_license: image?.license ?? null,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("updateListSpeciesImage:", err);
    return false;
  }
}

export async function removeSpeciesFromList(
  listId: string,
  gbifKey: number,
): Promise<{ species_count: number } | null> {
  try {
    const { data, error } = await supabase.rpc("remove_species_from_list", {
      p_list_id: listId,
      p_gbif_key: gbifKey,
    });

    if (error) throw error;
    return data as { species_count: number };
  } catch (err) {
    console.error("removeSpeciesFromList:", err);
    return null;
  }
}

export async function fetchListsWithSpecies(
  gbifKey: number,
  limit = 5,
  offset = 0,
): Promise<{ rows: ListPreviewWithCreator[]; totalCount: number }> {
  try {
    const { data, error } = await supabase.rpc("get_lists_with_species", {
      p_gbif_key: gbifKey,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;
    if (!data || data.length === 0) return { rows: [], totalCount: 0 };

    return {
      rows: data as ListPreviewWithCreator[],
      totalCount: Number((data[0] as { total_count: number }).total_count),
    };
  } catch (err) {
    console.error("fetchListsWithSpecies:", err);
    return { rows: [], totalCount: 0 };
  }
}

export async function fetchMyListsForPicker(
  gbifKey?: number,
): Promise<ListPickerItem[]> {
  try {
    const { data, error } = await supabase.rpc("get_my_lists_for_picker", {
      p_gbif_key: gbifKey ?? null,
    });

    if (error) throw error;
    return (data as ListPickerItem[]) || [];
  } catch (err) {
    console.error("fetchMyListsForPicker:", err);
    return [];
  }
}
