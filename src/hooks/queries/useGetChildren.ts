import { useQuery } from "@tanstack/react-query";
import { getChildren } from "@/services/api";
import queryClient from "@/services/queryClient";
import { QUERY_KEYS } from "./keys";

type UseGetChildrenParams = {
  parentKey: number;
  expanded: boolean;
};

export function useGetChildren({ parentKey, expanded }: UseGetChildrenParams) {
  const { children_key } = QUERY_KEYS;

  return useQuery({
    queryKey: [children_key, parentKey],
    queryFn: () => getChildren(parentKey),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled: !!parentKey && expanded,
    refetchOnMount: false,
    initialData: () =>
      parentKey
        ? queryClient.getQueryData([children_key, parentKey])
        : undefined,
  });
}
