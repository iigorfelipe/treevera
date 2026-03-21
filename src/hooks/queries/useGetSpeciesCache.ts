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
} from "@/services/apis/wikipedia";
import { getSpeciesStatusFromIUCN } from "@/services/apis/iucn";
import { getSpecieImageFromGBIF } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import { useTranslation } from "react-i18next";

type WikiDescription = {
  extract: string;
  description: string;
};

export type SpeciesCacheResult = {
  image: {
    imgUrl: string;
    source: string;
    licenseCode: string;
    author: string;
  } | null;
  iucnCode: StatusCode | null;
  iucnTrend: string | null;
  iucnYear: number | null;
  wikiDetails: WikiDescription | null;
  genusDetails: WikiDescription | null;
};

async function fetchDescriptionWithFallback(
  canonicalName: string,
  lang: string,
): Promise<{ extract: string; description: string } | null> {
  try {
    const wikiData = await getWikiSpecieDetail(canonicalName, lang);
    const text = wikiData?.extract ?? wikiData?.description ?? "";

    if (text) {
      return {
        extract: wikiData.extract ?? "",
        description: wikiData.description ?? "",
      };
    }
  } catch {
    //
  }

  if (lang !== "en") {
    try {
      const enData = await getWikiSpecieDetail(canonicalName, "en");
      const enText = enData?.extract ?? enData?.description ?? "";
      if (enText) {
        return {
          extract: enData.extract ?? "",
          description: enData.description ?? "",
        };
      }
    } catch {
      //
    }
  }

  return null;
}

export const useGetSpeciesCache = (
  gbifKey: number | undefined,
  canonicalName: string | undefined,
  genusName?: string,
  family?: string,
) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) ?? "pt";

  return useQuery<SpeciesCacheResult | null>({
    queryKey: [QUERY_KEYS.species_cache_key, gbifKey, lang],
    queryFn: async (): Promise<SpeciesCacheResult | null> => {
      if (!gbifKey || !canonicalName) return null;

      const cached = await getSpeciesCache(gbifKey);

      if (cached) {
        let iucnCode = (cached.iucn_code as StatusCode | null) ?? null;
        let iucnTrend = cached.iucn_population_trend ?? null;
        let iucnYear = cached.iucn_assessment_year ?? null;

        if (!cached.has_iucn) {
          const freshIucn = await getSpeciesStatusFromIUCN(canonicalName);
          if (freshIucn) {
            iucnCode = freshIucn.code;
            iucnTrend = freshIucn.trend;
            iucnYear = freshIucn.year;
            void upsertSpeciesCache({
              gbif_key: gbifKey,
              scientific_name: canonicalName,
              image_url: cached.image_url,
              image_source: cached.image_source,
              image_attribution: cached.image_attribution,
              image_license: cached.image_license,
              iucn_code: freshIucn.code,
              iucn_population_trend: freshIucn.trend,
              iucn_assessment_year: freshIucn.year,
              description_pt: cached.description_pt,
              description_source: cached.description_source,
              vernacular_names: cached.vernacular_names,
              family: cached.family ?? family ?? null,
              expires_at: cached.expires_at,
              has_image: cached.has_image,
              has_iucn: true,
              has_description: cached.has_description,
            });
          }
        }

        const usesCachedPt =
          lang === "pt" && cached.has_description && !!cached.description_pt;

        const [speciesResult, genusResult] = await Promise.allSettled([
          usesCachedPt
            ? Promise.resolve({
                extract: cached.description_pt!,
                description: "",
              })
            : fetchDescriptionWithFallback(canonicalName, lang),
          genusName
            ? fetchDescriptionWithFallback(genusName, lang)
            : Promise.resolve(null),
        ]);

        const wikiDetails =
          speciesResult.status === "fulfilled" ? speciesResult.value : null;
        const genusDetails =
          genusResult.status === "fulfilled" ? genusResult.value : null;

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
          iucnCode,
          iucnTrend,
          iucnYear,
          wikiDetails,
          genusDetails,
        };
      }

      const [
        iNatResult,
        wikiImgResult,
        wikiDetailResult,
        iucnResult,
        genusResult,
      ] = await Promise.allSettled([
        getSpecieImageFromINaturalist({ canonicalName }),
        getSpecieImageFromWikipedia({ canonicalName }),
        fetchDescriptionWithFallback(canonicalName, lang),
        getSpeciesStatusFromIUCN(canonicalName),
        genusName
          ? fetchDescriptionWithFallback(genusName, lang)
          : Promise.resolve(null),
      ]);

      const iNatImg =
        iNatResult.status === "fulfilled" ? iNatResult.value : null;
      const wikiImg =
        wikiImgResult.status === "fulfilled" ? wikiImgResult.value : null;
      const wikiDetails =
        wikiDetailResult.status === "fulfilled" ? wikiDetailResult.value : null;
      const iucn = iucnResult.status === "fulfilled" ? iucnResult.value : null;
      const genusDetails =
        genusResult.status === "fulfilled" ? genusResult.value : null;

      let image = iNatImg ?? wikiImg ?? null;
      if (!image) {
        try {
          const gbifImg = await getSpecieImageFromGBIF({ specieKey: gbifKey });
          image = gbifImg ?? null;
        } catch {
          //
        }
      }

      const description =
        wikiDetails?.extract ?? wikiDetails?.description ?? null;

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
        iucn_code: iucn?.code ?? null,
        iucn_population_trend: iucn?.trend ?? null,
        iucn_assessment_year: iucn?.year ?? null,
        description_pt: lang === "pt" ? description : null,
        description_source: null,
        vernacular_names: null,
        family: family ?? null,
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
        iucnCode: iucn?.code ?? null,
        iucnTrend: iucn?.trend ?? null,
        iucnYear: iucn?.year ?? null,
        wikiDetails,
        genusDetails,
      };
    },
    enabled: !!gbifKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 dias
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
