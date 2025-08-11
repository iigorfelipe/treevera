import { useQuery } from "@tanstack/react-query";
import { getChildren } from "@/services/apis/gbif";
import queryClient from "@/services/queryClient";
import { QUERY_KEYS } from "./keys";

type UseGetChildrenParams = {
  parentKey: number;
  expanded: boolean;
  numDescendants: number;
};

export function useGetChildren({
  parentKey,
  expanded,
  numDescendants,
}: UseGetChildrenParams) {
  const { children_key } = QUERY_KEYS;

  return useQuery({
    queryKey: [children_key, parentKey],
    queryFn: () => getChildren(parentKey),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled: !!parentKey && expanded && numDescendants !== 0,
    refetchOnMount: false,
    initialData: () =>
      parentKey
        ? queryClient.getQueryData([children_key, parentKey])
        : undefined,
  });
}
