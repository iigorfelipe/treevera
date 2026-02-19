import { useQuery } from "@tanstack/react-query";

import { getSpecieImageFromINaturalist } from "@/services/apis/iNaturalist";
import { getSpecieImageFromWikipedia } from "@/services/apis/wikipedia";
import { getSpecieImageFromGBIF } from "@/services/apis/gbif";

export const useGetSpecieImage = (
  specieKey?: number,
  canonicalName?: string,
) => {
  return useQuery({
    queryKey: ["specie-image", specieKey, canonicalName],
    queryFn: async () => {
      if (!specieKey || !canonicalName) return null;

      const iNatData = await getSpecieImageFromINaturalist({ canonicalName });
      if (iNatData) return iNatData;

      const wikiData = await getSpecieImageFromWikipedia({ canonicalName });
      if (wikiData) return wikiData;

      const gbifData = await getSpecieImageFromGBIF({ specieKey });
      return gbifData;
    },
    enabled: !!specieKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
  });
};
