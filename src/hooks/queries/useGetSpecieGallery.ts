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

      const MAX_IMAGES = 10;
      const INAT_SLOTS = 7; // iNat occupies at most these many slots
      const seen = new Set<string>();

      function dedup(
        img: GalleryImage | null | undefined,
      ): GalleryImage | null {
        if (!img || seen.has(img.imgUrl)) return null;
        seen.add(img.imgUrl);
        return img;
      }

      // 1. iNaturalist: fill up to INAT_SLOTS, keep the rest as extras
      const inatAll = await getSpecieImagesFromINaturalist({
        canonicalName,
      }).catch(() => []);
      const images: GalleryImage[] = [];
      const inatExtra: GalleryImage[] = [];
      for (const img of inatAll) {
        const d = dedup(img);
        if (!d) continue;
        if (images.length < INAT_SLOTS) images.push(d);
        else inatExtra.push(d);
      }

      // 2. Wikimedia Commons: fill remaining slots up to MAX_IMAGES
      if (images.length < MAX_IMAGES) {
        const commonsAll = await getSpecieImagesFromWikimediaCommons({
          canonicalName,
        }).catch(() => []);
        for (const img of commonsAll) {
          if (images.length >= MAX_IMAGES) break;
          const d = dedup(img);
          if (d) images.push(d);
        }
      }

      // 3. GBIF: fill one more slot if still short
      if (images.length < MAX_IMAGES) {
        const gbifImage = await getSpecieImageFromGBIF({ specieKey }).catch(
          () => null,
        );
        const d = dedup(gbifImage);
        if (d) images.push(d);
      }

      // 4. Extra iNat as last resort to reach MAX_IMAGES
      for (const img of inatExtra) {
        if (images.length >= MAX_IMAGES) break;
        images.push(img);
      }

      return images;
    },
    enabled: !!specieKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};
