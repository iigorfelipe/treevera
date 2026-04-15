import { useQuery } from "@tanstack/react-query";
import { getSpecieImagesFromINaturalist } from "@/services/apis/iNaturalist";
import { getSpecieImagesFromWikimediaCommons } from "@/services/apis/wikipedia";
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

      const MAX_IMAGES = 7;
      const seen = new Set<string>();
      const images: GalleryImage[] = [];

      function add(img: GalleryImage | null | undefined) {
        if (!img || seen.has(img.imgUrl)) return;
        seen.add(img.imgUrl);
        images.push(img);
      }

      const iNatResult = await getSpecieImagesFromINaturalist({
        canonicalName,
      }).catch(() => []);
      iNatResult.forEach(add);

      if (images.length < MAX_IMAGES) {
        const commonsResult = await getSpecieImagesFromWikimediaCommons({
          canonicalName,
        }).catch(() => []);
        commonsResult.forEach(add);
      }

      if (images.length < MAX_IMAGES) {
        const gbifImage = await getSpecieImageFromGBIF({
          specieKey,
        }).catch(() => null);
        add(gbifImage);
      }

      return images.slice(0, MAX_IMAGES);
    },
    enabled: !!specieKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};
