import { useQuery } from "@tanstack/react-query";
import { getSpecieImagesFromINaturalist } from "@/services/apis/iNaturalist";
import { getSpecieImageFromWikipedia } from "@/services/apis/wikipedia";
import { getSpecieImageFromGBIF } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";

export type GalleryImage = {
  imgUrl: string;
  source: string;
  licenseCode: string;
  author: string;
};

export const useGetSpecieGallery = (
  specieKey: number | undefined,
  canonicalName: string | undefined,
) => {
  return useQuery<GalleryImage[]>({
    queryKey: [QUERY_KEYS.specie_gallery_key, specieKey],
    queryFn: async (): Promise<GalleryImage[]> => {
      if (!canonicalName || !specieKey) return [];

      const iNatResult = await getSpecieImagesFromINaturalist({
        canonicalName,
      }).catch(() => []);

      if (iNatResult.length > 0) return iNatResult;

      const wikiImage = await getSpecieImageFromWikipedia({
        canonicalName,
      }).catch(() => null);

      if (wikiImage) return [wikiImage];

      const gbifImage = await getSpecieImageFromGBIF({
        specieKey,
      }).catch(() => null);

      if (gbifImage) return [gbifImage];

      return [];
    },
    enabled: !!specieKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};
