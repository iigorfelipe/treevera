import { useQuery } from "@tanstack/react-query";
import type { StatusCode } from "@/common/components/vulnerability-badge";
import {
  getSpeciesCache,
  upsertSpeciesCache,
} from "@/common/utils/supabase/species-cache";
import { getSpecieImageFromINaturalist } from "@/services/apis/iNaturalist";
import {
  getSpecieImageFromWikipedia,
  getWikiSpecieDetail,
  getSpeciesStatusFromWikidata,
} from "@/services/apis/wikipedia";
import { getSpecieImageFromGBIF } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";

export type SpeciesCacheResult = {
  image: {
    imgUrl: string;
    source: string;
    licenseCode: string;
    author: string;
  } | null;
  iucnCode: StatusCode | null;
  wikiDetails: {
    extract: string;
    description: string;
  } | null;
};

export const useGetSpeciesCache = (
  gbifKey: number | undefined,
  canonicalName: string | undefined,
) => {
  return useQuery<SpeciesCacheResult | null>({
    queryKey: [QUERY_KEYS.species_cache_key, gbifKey],
    queryFn: async (): Promise<SpeciesCacheResult | null> => {
      if (!gbifKey || !canonicalName) return null;

      const cached = await getSpeciesCache(gbifKey);

      if (cached) {
        return {
          image:
            cached.has_image && cached.image_url
              ? {
                  imgUrl: cached.image_url,
                  source: cached.image_source ?? "",
                  licenseCode: cached.image_license ?? "",
                  author: cached.image_attribution ?? "",
                }
              : null,
          iucnCode: (cached.iucn_code as StatusCode | null) ?? null,
          wikiDetails:
            cached.has_description && cached.description_pt
              ? {
                  extract: cached.description_pt,
                  description: "",
                }
              : null,
        };
      }

      const [iNatResult, wikiImgResult, wikiDetailResult, iucnResult] =
        await Promise.allSettled([
          getSpecieImageFromINaturalist({ canonicalName }),
          getSpecieImageFromWikipedia({ canonicalName }),
          getWikiSpecieDetail(canonicalName),
          getSpeciesStatusFromWikidata(canonicalName),
        ]);

      const iNatImg =
        iNatResult.status === "fulfilled" ? iNatResult.value : null;
      const wikiImg =
        wikiImgResult.status === "fulfilled" ? wikiImgResult.value : null;
      const wikiData =
        wikiDetailResult.status === "fulfilled" ? wikiDetailResult.value : null;
      const iucn = iucnResult.status === "fulfilled" ? iucnResult.value : null;

      let image = iNatImg ?? wikiImg ?? null;
      if (!image) {
        try {
          const gbifImg = await getSpecieImageFromGBIF({ specieKey: gbifKey });
          image = gbifImg ?? null;
        } catch {
          //
        }
      }

      const description = wikiData?.extract ?? wikiData?.description ?? null;

      const expires_at = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      void upsertSpeciesCache({
        gbif_key: gbifKey,
        scientific_name: canonicalName,
        image_url: image?.imgUrl ?? null,
        image_source: image?.source ?? null,
        image_attribution: image?.author ?? null,
        image_license: image?.licenseCode ?? null,
        iucn_code: iucn,
        description_pt: description,
        description_source: null,
        vernacular_names: null,
        expires_at,
        has_image: !!image,
        has_iucn: iucn !== null,
        has_description: !!description,
      });

      return {
        image: image
          ? {
              imgUrl: image.imgUrl,
              source: image.source,
              licenseCode: image.licenseCode ?? "",
              author: image.author ?? "",
            }
          : null,
        iucnCode: iucn,
        wikiDetails: wikiData
          ? {
              extract: wikiData.extract ?? "",
              description: wikiData.description ?? "",
            }
          : null,
      };
    },
    enabled: !!gbifKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 dias
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
