import { useIsRestoring, useQuery } from "@tanstack/react-query";
import { getKingdoms } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { Taxon, RootTaxonNode } from "@/common/types/api";
import { COLOR_KINGDOM_BY_KEY } from "@/common/constants/tree";

const kingdomsMapped = (data: Taxon[]) => {
  const seen = new Set<string>();
  return data
    .filter((item) => {
      if (seen.has(item.kingdom)) return false;
      if (item.kingdom.toLowerCase() === "viruses") return false;
      seen.add(item.kingdom);
      return true;
    })
    .map((item) => {
      return {
        key: item.key,
        rank: item.rank,
        numDescendants: item.numDescendants,
        color: COLOR_KINGDOM_BY_KEY[item.key],
      };
    });
};

export const useGetKingdoms = () => {
  const { kingdoms_key } = QUERY_KEYS;
  const isRestoring = useIsRestoring();

  return useQuery<RootTaxonNode[]>({
    queryKey: [kingdoms_key],
    queryFn: async () => {
      const data = await getKingdoms();
      return kingdomsMapped(data);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !isRestoring,
  });
};
