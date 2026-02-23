import { useQuery } from "@tanstack/react-query";
import { getParents } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { Taxon } from "@/common/types/api";

export const useGetParents = (speciesKey: number, enabled: boolean) => {
  return useQuery<Taxon[]>({
    queryKey: [QUERY_KEYS.parents_key, speciesKey],
    queryFn: () => getParents(speciesKey),
    enabled: enabled && !!speciesKey,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
