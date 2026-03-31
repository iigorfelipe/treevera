import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
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
  fetchListsWithSpecies,
  toggleListLike,
  createList,
  updateList,
  deleteList,
  addSpeciesToList,
  removeSpeciesFromList,
  fetchMyListsForPicker,
} from "@/common/utils/supabase/lists";
import type { ListWithCreator } from "@/common/types/lists";

const PAGE_SIZE = 50;

export function useGetUserLists(userId: string | undefined, limit: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.user_lists_key, userId, limit],
    queryFn: () => fetchUserLists(userId!, limit),
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
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.public_lists_key],
      });
    },
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { title: string; description?: string }) =>
      createList(params.title, params.description),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_lists_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.public_lists_key],
      });
    },
  });
}

export function useUpdateList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { title?: string; description?: string }) =>
      updateList(listId, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_detail_key, listId],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_lists_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.public_lists_key],
      });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_lists_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.public_lists_key],
      });
    },
  });
}

export function useAddSpeciesToList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gbifKey: number) => addSpeciesToList(listId, gbifKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_species_key, listId],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_detail_key, listId],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.my_lists_picker_key],
      });
    },
  });
}

export function useRemoveSpeciesFromList(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gbifKey: number) => removeSpeciesFromList(listId, gbifKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_species_key, listId],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_detail_key, listId],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.my_lists_picker_key],
      });
    },
  });
}

export function useGetListsWithSpecies(gbifKey: number | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.lists_with_species_key, gbifKey],
    queryFn: () => fetchListsWithSpecies(gbifKey!),
    enabled: !!gbifKey,
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
