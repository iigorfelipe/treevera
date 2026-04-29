import { useQuery } from "@tanstack/react-query";
import { getVernacularNames } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { VernacularName } from "@/common/types/api";
import { selectPrimaryCommonNames } from "@/common/utils/common-names";

export const useGetVernacularNames = (
  speciesKey: number | undefined,
  canonicalName?: string,
  currentLanguage?: string,
) => {
  return useQuery<VernacularName[]>({
    queryKey: [QUERY_KEYS.vernacular_names_key, speciesKey],
    queryFn: async () => {
      if (!speciesKey) return [];
      return getVernacularNames(speciesKey);
    },
    select: (results) =>
      selectPrimaryCommonNames(results, canonicalName, currentLanguage),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    enabled: !!speciesKey,
  });
};
