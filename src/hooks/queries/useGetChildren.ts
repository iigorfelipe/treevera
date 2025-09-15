import { useQuery } from "@tanstack/react-query";
import { getChildren } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { Rank, Taxon } from "@/common/types/api";
import { filterChildrenByRank } from "@/common/utils/tree/children";

type UseGetChildrenParams = {
  parentKey: number;
  expanded: boolean;
  numDescendants: number;
  rank: Rank;
};

export const mapToTaxon = (item: Taxon): Taxon => {
  const taxon: Taxon = {
    key: item.key,
    scientificName: item.scientificName,
    canonicalName: item.canonicalName,
    rank: item.rank,
    kingdom: item.kingdom,
    numDescendants: item.numDescendants,
    phylum: item.phylum,
  };

  if (item.class) taxon.class = item.class;
  if (item.order) taxon.order = item.order;
  if (item.family) taxon.family = item.family;
  if (item.genus) taxon.genus = item.genus;

  return taxon;
};

export const useGetChildren = ({
  parentKey,
  expanded,
  numDescendants,
  rank,
}: UseGetChildrenParams) => {
  const { children_key } = QUERY_KEYS;

  return useQuery<Taxon[]>({
    queryKey: [children_key, parentKey],
    queryFn: async () => {
      const data = await getChildren(parentKey);
      const filteredChildren = filterChildrenByRank(rank, data);
      return filteredChildren.map(mapToTaxon);
    },
    enabled: !!parentKey && expanded && numDescendants !== 0,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
