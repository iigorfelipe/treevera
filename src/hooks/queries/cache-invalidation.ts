import type { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";

const normalizeUsername = (username?: string | null) =>
  username?.trim().toLowerCase() || undefined;

export const invalidateListSummaryQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.user_lists_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.user_liked_lists_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.public_lists_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.featured_lists_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.my_lists_picker_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.search_lists_key],
  });
};

export const invalidateListProjectionQueries = (queryClient: QueryClient) => {
  invalidateListSummaryQueries(queryClient);
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.lists_with_species_key],
  });
};

export const invalidateUserPublicProfileQuery = (
  queryClient: QueryClient,
  username?: string | null,
) => {
  const normalized = normalizeUsername(username);
  if (!normalized) return;

  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.public_profile_key, normalized],
  });
};

export const invalidateUserIdentityQueries = (
  queryClient: QueryClient,
  username?: string | null,
  previousUsername?: string | null,
) => {
  invalidateUserPublicProfileQuery(queryClient, username);
  invalidateUserPublicProfileQuery(queryClient, previousUsername);
  invalidateListSummaryQueries(queryClient);

  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.search_users_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.list_detail_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.list_likers_key],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.species_favoriters_key],
  });
};

export const invalidateCurrentUserSpeciesQueries = (
  queryClient: QueryClient,
  {
    userId,
    username,
    gbifKey,
    includeAchievementProgress = true,
  }: {
    userId?: string | null;
    username?: string | null;
    gbifKey?: number;
    includeAchievementProgress?: boolean;
  },
) => {
  if (userId) {
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_seen_species_key, userId],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_seen_species_key, "recent", userId],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.favorite_species_page_key, userId],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.specie_gallery_key, userId],
    });
    void queryClient.invalidateQueries({
      queryKey:
        gbifKey === undefined
          ? [QUERY_KEYS.seen_specie_by_key_key, userId]
          : [QUERY_KEYS.seen_specie_by_key_key, userId, gbifKey],
    });
    void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === QUERY_KEYS.user_seen_in_list_key &&
        query.queryKey[2] === userId,
    });

    if (includeAchievementProgress) {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.achievement_progress_key, userId],
      });
    }
  }

  invalidateUserPublicProfileQuery(queryClient, username);
};
