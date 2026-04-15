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
      const INAT_SLOTS = 7;
      const RESERVED_SLOTS = 3; // reserved for Wikimedia → GBIF → iNat leftover
      const seen = new Set<string>();

      function dedup(
        img: GalleryImage | null | undefined,
      ): GalleryImage | null {
        if (!img || seen.has(img.imgUrl)) return null;
        seen.add(img.imgUrl);
        return img;
      }

      // 1. Fetch iNaturalist (up to 10 so we have leftovers if needed)
      const inatAll = await getSpecieImagesFromINaturalist({
        canonicalName,
      }).catch(() => []);
      const inatMain: GalleryImage[] = [];
      const inatExtra: GalleryImage[] = [];
      for (const img of inatAll) {
        const d = dedup(img);
        if (!d) continue;
        if (inatMain.length < INAT_SLOTS) inatMain.push(d);
        else if (inatExtra.length < RESERVED_SLOTS) inatExtra.push(d);
      }

      // 2. Fill reserved slots: Wikimedia Commons first
      const reserved: GalleryImage[] = [];
      const commonsAll = await getSpecieImagesFromWikimediaCommons({
        canonicalName,
      }).catch(() => []);
      for (const img of commonsAll) {
        if (reserved.length >= RESERVED_SLOTS) break;
        const d = dedup(img);
        if (d) reserved.push(d);
      }

      // 3. If Wikimedia didn't fill the reserved slots, try GBIF
      if (reserved.length < RESERVED_SLOTS) {
        const gbifImage = await getSpecieImageFromGBIF({ specieKey }).catch(
          () => null,
        );
        const d = dedup(gbifImage);
        if (d) reserved.push(d);
      }

      // 4. Still short? Fill with leftover iNat images
      for (const img of inatExtra) {
        if (reserved.length >= RESERVED_SLOTS) break;
        reserved.push(img);
      }

      return [...inatMain, ...reserved].slice(0, MAX_IMAGES);
    },
    enabled: !!specieKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};
