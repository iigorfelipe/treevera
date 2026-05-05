import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { QUERY_KEYS } from "./keys";
import {
  fetchPublicLists,
  fetchUserLists,
  fetchUserLikedLists,
  fetchListDetail,
  fetchListSpecies,
  fetchUserSeenInList,
  fetchListsWithSpecies,
  fetchListLikers,
  fetchListLikersPage,
  toggleListLike,
  createList,
  updateList,
  deleteList,
  addSpeciesToList,
  removeSpeciesFromList,
  fetchMyListsForPicker,
  fetchFeaturedLists,
  setFeaturedLists,
} from "@/common/utils/supabase/lists";
import { getListSlugParam } from "@/common/utils/list-url";
import type { ListWithCreator } from "@/common/types/lists";
import {
  invalidateListProjectionQueries,
  invalidateListSummaryQueries,
} from "./cache-invalidation";

const PAGE_SIZE = 50;

const updateCachedListSpeciesCount = (
  queryClient: QueryClient,
  listId: string,
  speciesCount?: number | null,
) => {
  if (speciesCount == null) return;

  queryClient.setQueriesData<ListWithCreator | null>(
    { queryKey: [QUERY_KEYS.list_detail_key] },
    (current) =>
      current?.id === listId
        ? {
            ...current,
            species_count: speciesCount,
            updated_at: new Date().toISOString(),
          }
        : current,
  );
};

export function useGetUserLists(userId: string | undefined, limit: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.user_lists_key, userId, limit],
    queryFn: () => fetchUserLists(userId!, limit),
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useGetUserListsInfinite(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.user_lists_key, userId, "infinite"],
    queryFn: ({ pageParam = 0 }) =>
      fetchUserLists(userId!, PAGE_SIZE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.rows.length, 0);
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useGetUserLikedLists(
  userId: string | undefined,
  limit: number,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.user_liked_lists_key, userId, limit],
    queryFn: () => fetchUserLikedLists(userId!, limit),
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useGetUserLikedListsInfinite(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.user_liked_lists_key, userId, "infinite"],
    queryFn: ({ pageParam = 0 }) =>
      fetchUserLikedLists(userId!, PAGE_SIZE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.rows.length, 0);
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useGetPublicLists(options: {
  sort: "recent" | "popular";
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.public_lists_key, options.sort, options.search],
    queryFn: ({ pageParam = 0 }) =>
      fetchPublicLists(
        PAGE_SIZE,
        pageParam as number,
        options.sort,
        options.search,
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.rows.length, 0);
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    staleTime: 2 * 60_000,
  });
}

export function useGetListDetail(
  username: string | undefined,
  slug: string | undefined,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.list_detail_key, username, slug],
    queryFn: () => fetchListDetail(username!, slug!),
    enabled: !!username && !!slug,
    staleTime: 5 * 60_000,
  });
}

export function useGetListSpecies(listId: string | undefined) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.list_species_key, listId],
    queryFn: ({ pageParam = 0 }) =>
      fetchListSpecies(listId!, PAGE_SIZE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.rows.length, 0);
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    enabled: !!listId,
    staleTime: 5 * 60_000,
  });
}

export function useToggleListLike(
  listId: string,
  username?: string,
  slug?: string,
) {
  const queryClient = useQueryClient();
  const detailKey = [QUERY_KEYS.list_detail_key, username, slug];

  return useMutation({
    mutationFn: () => toggleListLike(listId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<ListWithCreator>(detailKey);
      if (previous) {
        queryClient.setQueryData(detailKey, {
          ...previous,
          is_liked: !previous.is_liked,
          likes_count: previous.is_liked
            ? Math.max(previous.likes_count - 1, 0)
            : previous.likes_count + 1,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: detailKey });
      invalidateListSummaryQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_likers_key],
      });
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      title: string;
      description?: string;
      is_public?: boolean;
    }) => createList(params.title, params.description, params.is_public),
    onSuccess: () => {
      invalidateListSummaryQueries(queryClient);
    },
  });
}

export function useUpdateList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      title?: string;
      description?: string;
      is_public?: boolean;
    }) => {
      const updated = await updateList(listId, updates);
      if (!updated) throw new Error("Failed to update list");
      return updated;
    },
    onSuccess: (_updated, updates) => {
      queryClient.setQueriesData<ListWithCreator | null>(
        { queryKey: [QUERY_KEYS.list_detail_key] },
        (current) => {
          if (!current || current.id !== listId) return current;

          return {
            ...current,
            ...(updates.title !== undefined
              ? {
                  title: updates.title,
                  slug: getListSlugParam(updates.title, null, listId),
                }
              : {}),
            ...(updates.description !== undefined
              ? { description: updates.description ?? null }
              : {}),
            ...(updates.is_public !== undefined
              ? { is_public: updates.is_public }
              : {}),
            updated_at: new Date().toISOString(),
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_detail_key],
      });
      invalidateListProjectionQueries(queryClient);
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: () => {
      invalidateListProjectionQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_detail_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_species_key],
      });
    },
  });
}

export function useAddSpeciesToList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gbifKey,
      image,
    }: {
      gbifKey: number;
      image?: {
        url?: string | null;
        source?: string | null;
        author?: string | null;
        license?: string | null;
      };
    }) => addSpeciesToList(listId, gbifKey, image),
    onSuccess: (data, variables) => {
      updateCachedListSpeciesCount(queryClient, listId, data?.species_count);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_species_key, listId],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_detail_key],
      });
      invalidateListSummaryQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.lists_with_species_key, variables.gbifKey],
      });
    },
  });
}

export function useRemoveSpeciesFromList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gbifKey: number) => removeSpeciesFromList(listId, gbifKey),
    onSuccess: (data, gbifKey) => {
      updateCachedListSpeciesCount(queryClient, listId, data?.species_count);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_species_key, listId],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_detail_key],
      });
      invalidateListSummaryQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.lists_with_species_key, gbifKey],
      });
    },
  });
}

export function useGetListsWithSpecies(gbifKey: number | undefined, limit = 5) {
  return useQuery({
    queryKey: [QUERY_KEYS.lists_with_species_key, gbifKey, limit],
    queryFn: () => fetchListsWithSpecies(gbifKey!, limit),
    enabled: !!gbifKey,
    staleTime: 5 * 60_000,
  });
}

export function useGetListsWithSpeciesInfinite(gbifKey: number | undefined) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.lists_with_species_key, gbifKey, "infinite"],
    queryFn: ({ pageParam = 0 }) =>
      fetchListsWithSpecies(gbifKey!, PAGE_SIZE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.rows.length, 0);
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    enabled: !!gbifKey,
    staleTime: 5 * 60_000,
  });
}

export function useGetListLikers(
  username: string | undefined,
  slug: string | undefined,
) {
  return useQuery({
    queryKey: [QUERY_KEYS.list_likers_key, username, slug],
    queryFn: () => fetchListLikers(username!, slug!),
    enabled: !!username && !!slug,
    staleTime: 2 * 60_000,
  });
}

export function useGetListLikersInfinite(
  username: string | undefined,
  slug: string | undefined,
) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.list_likers_key, username, slug, "infinite"],
    queryFn: ({ pageParam = 0 }) =>
      fetchListLikersPage(username!, slug!, PAGE_SIZE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.rows.length, 0);
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    enabled: !!username && !!slug,
    staleTime: 2 * 60_000,
  });
}

export function useGetUserSeenInList(listId: string | undefined) {
  const userDb = useAtomValue(authStore.userDb);

  return useQuery({
    queryKey: [QUERY_KEYS.user_seen_in_list_key, listId, userDb?.id],
    queryFn: () => fetchUserSeenInList(listId!),
    enabled: !!listId && !!userDb,
    staleTime: 5 * 60_000,
  });
}

export function useGetMyListsForPicker(gbifKey?: number) {
  const userDb = useAtomValue(authStore.userDb);

  return useQuery({
    queryKey: [QUERY_KEYS.my_lists_picker_key, userDb?.id, gbifKey],
    queryFn: () => fetchMyListsForPicker(gbifKey),
    enabled: !!userDb,
    staleTime: 2 * 60_000,
  });
}

export function useGetFeaturedLists() {
  return useQuery({
    queryKey: [QUERY_KEYS.featured_lists_key],
    queryFn: fetchFeaturedLists,
    staleTime: 5 * 60_000,
  });
}

export function useSetFeaturedLists() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listIds: string[]) => setFeaturedLists(listIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.featured_lists_key],
      });
    },
  });
}
