import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import {
  fetchSeenSpecies,
  fetchSeenSpecieByKey,
  fetchFavoriteSpeciesPage,
  fetchGalleryPage,
  fetchSpeciesFavCount,
  fetchSpeciesFavoriters,
} from "@/common/utils/supabase/user-seen-species";
import type { FetchSeenSpeciesPageOptions } from "@/common/utils/supabase/user-seen-species";
import { batchGetImageAttribution } from "@/common/utils/supabase/species-cache";
import { QUERY_KEYS } from "./keys";

export const useGetUserSeenSpecies = (options?: { enabled?: boolean }) => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;
  const externalEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: [QUERY_KEYS.user_seen_species_key, userId],
    queryFn: () => fetchSeenSpecies(userId!),
    enabled: !!userId && externalEnabled,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 60 * 24, // 24h
  });
};

export const useGetRecentSeenSpecies = (limit: number, userId?: string) => {
  const session = useAtomValue(authStore.session);
  const sessionUserId = session?.user?.id;
  const targetUserId = userId ?? sessionUserId;

  return useQuery({
    queryKey: [QUERY_KEYS.user_seen_species_key, "recent", targetUserId, limit],
    queryFn: async () => {
      const page = await fetchGalleryPage(targetUserId!, 0, limit, {
        sortOrder: "newest",
        photosFirst: false,
      });
      return {
        totalCount: page.totalCount,
        species: page.rows.map((r) => ({
          user_id: targetUserId!,
          gbif_key: r.gbif_key,
          seen_at: r.seen_at,
          is_favorite: r.is_favorite,
          kingdom: null,
          iucn_status: null,
          preferred_image_url: r.image_url,
          preferred_image_source: r.image_source ?? null,
          preferred_image_attribution: r.image_attribution ?? null,
          preferred_image_license: r.image_license ?? null,
          canonical_name: r.canonical_name,
          family: r.family,
          is_in_gallery: r.is_in_gallery,
        })),
      };
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useGetSeenSpecieByKey = (specieKey: number | undefined) => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: [QUERY_KEYS.seen_specie_by_key_key, userId, specieKey],
    queryFn: () => fetchSeenSpecieByKey(userId!, specieKey!),
    enabled: !!userId && specieKey != null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

const FAV_PAGE_SIZE = 50;

export const useGetFavoriteSpeciesPages = (enabled: boolean) => {
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.favorite_species_page_key, userId],
    queryFn: ({ pageParam = 0 }) =>
      fetchFavoriteSpeciesPage(userId!, pageParam, FAV_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.length * FAV_PAGE_SIZE;
      return loaded < lastPage.totalCount ? allPages.length : undefined;
    },
    enabled: !!userId && enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

const GALLERY_PAGE_SIZE = 50;

export const useGetGallerySpecies = (
  options: FetchSeenSpeciesPageOptions = {},
  userId?: string,
) => {
  const session = useAtomValue(authStore.session);
  const sessionUserId = session?.user?.id;
  const targetUserId = userId ?? sessionUserId;

  return useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.specie_gallery_key,
      targetUserId,
      options.favoritesOnly,
      options.sortOrder,
      options.photosFirst,
      options.search,
    ],
    queryFn: ({ pageParam = 0 }) =>
      fetchGalleryPage(targetUserId!, pageParam, GALLERY_PAGE_SIZE, options),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.length * GALLERY_PAGE_SIZE;
      return loaded < lastPage.totalCount ? allPages.length : undefined;
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useGetBatchAttribution = (gbifKeys: number[]) => {
  const sortedKeys = [...gbifKeys].sort((a, b) => a - b);
  return useQuery({
    queryKey: [QUERY_KEYS.species_attribution_key, sortedKeys.join(",")],
    queryFn: () => batchGetImageAttribution(sortedKeys),
    enabled: sortedKeys.length > 0,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};

export const useGetSpeciesFavCount = (gbifKey: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.species_fav_count_key, gbifKey],
    queryFn: () => fetchSpeciesFavCount(gbifKey!),
    enabled: !!gbifKey,
    staleTime: 2 * 60_000,
  });
};

export const useGetSpeciesFavoriters = (gbifKey: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.species_favoriters_key, gbifKey],
    queryFn: () => fetchSpeciesFavoriters(gbifKey!),
    enabled: !!gbifKey,
    staleTime: 2 * 60_000,
  });
};

export const useInvalidateSpeciesFavCount = () => {
  const queryClient = useQueryClient();
  return (gbifKey: number) =>
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.species_fav_count_key, gbifKey],
    });
};
