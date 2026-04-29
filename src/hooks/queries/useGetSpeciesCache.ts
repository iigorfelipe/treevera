import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import type { StatusCode } from "@/common/components/vulnerability-badge";
import {
  getSpeciesCache,
  upsertSpeciesCache,
  type SpeciesCacheRow,
} from "@/common/utils/supabase/species-cache";
import { getSpecieImageFromINaturalist } from "@/services/apis/iNaturalist";
import {
  getSpecieImageFromWikipedia,
  getWikiSpecieDetail,
} from "@/services/apis/wikipedia";
import { getSpeciesStatusFromIUCN } from "@/services/apis/iucn";
import { getSpecieImageFromGBIF } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";

type WikiDescription = {
  title?: string;
  language?: string;
  extractHtml?: string;
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

type FetchFreshParams = {
  gbifKey: number;
  canonicalName: string;
  genusName?: string;
  family?: string;
  lang: string;
  base?: SpeciesCacheResult;
  existingDescriptionPt?: string | null;
  existingHasDescription?: boolean;
};

const BIOLOGICAL_TERMS = [
  "genus",
  "genero",
  "species",
  "especie",
  "especies",
  "familia",
  "family",
  "planta",
  "plant",
  "vegetal",
  "animal",
  "fungo",
  "fungus",
  "taxon",
  "taxonom",
  "phylum",
  "filo",
];

const DISAMBIGUATION_SUFFIXES: Record<string, string[]> = {
  pt: [
    "(gênero)",
    "(género)",
    "(botânica)",
    "(zoologia)",
    "(biologia)",
    "(genero)",
    "(botanica)",
  ],
  en: ["(genus)", "(biology)", "(botany)"],
  es: [
    "(género)",
    "(botánica)",
    "(biología)",
    "(zoología)",
    "(genero)",
    "(botanica)",
    "(biologia)",
    "(zoologia)",
  ],
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isBiologicalArticle(wikiData: {
  description?: string;
  extract?: string;
}): boolean {
  const text = normalizeSearchText(
    `${wikiData.description ?? ""} ${(wikiData.extract ?? "").slice(0, 300)}`,
  );
  return BIOLOGICAL_TERMS.some((term) => text.includes(term));
}

async function fetchWikiValidated(
  name: string,
  lang: string,
  mustBeTaxon: boolean,
): Promise<WikiDescription | null> {
  try {
    const wikiData = await getWikiSpecieDetail(name, lang);
    const text = wikiData?.extract ?? wikiData?.description ?? "";
    if (!text) return null;
    if (!mustBeTaxon || isBiologicalArticle(wikiData)) {
      return {
        title: wikiData.title ?? "",
        language: lang,
        extractHtml: wikiData.extract_html ?? "",
        extract: wikiData.extract ?? "",
        description: wikiData.description ?? "",
      };
    }
  } catch {
    //
  }
  return null;
}

async function fetchDescriptionWithFallback(
  canonicalName: string,
  lang: string,
  isTaxon = false,
): Promise<WikiDescription | null> {
  const result = await fetchWikiValidated(canonicalName, lang, isTaxon);
  if (result) return result;

  if (isTaxon) {
    const suffixes =
      DISAMBIGUATION_SUFFIXES[lang] ?? DISAMBIGUATION_SUFFIXES.en;
    for (const suffix of suffixes) {
      const disambig = await fetchWikiValidated(
        `${canonicalName} ${suffix}`,
        lang,
        true,
      );
      if (disambig) return disambig;
    }
  }

  if (lang !== "en") {
    const enResult = await fetchWikiValidated(canonicalName, "en", isTaxon);
    if (enResult) return enResult;

    if (isTaxon) {
      for (const suffix of DISAMBIGUATION_SUFFIXES.en) {
        const disambig = await fetchWikiValidated(
          `${canonicalName} ${suffix}`,
          "en",
          true,
        );
        if (disambig) return disambig;
      }
    }
  }

  return null;
}

function buildCachedResult(
  cached: SpeciesCacheRow,
  lang: string,
): SpeciesCacheResult {
  const cachedDescription =
    lang === "pt" && cached.has_description && cached.description_pt
      ? {
          title: cached.scientific_name,
          language: "pt",
          extractHtml: "",
          extract: cached.description_pt,
          description: "",
        }
      : null;

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
    iucnTrend: cached.iucn_population_trend ?? null,
    iucnYear: cached.iucn_assessment_year ?? null,
    wikiDetails: cachedDescription,
    genusDetails: null,
  };
}

function shouldRefreshCachedSpecies(
  cached: SpeciesCacheRow,
  cachedResult: SpeciesCacheResult,
) {
  return !cached.has_image || !cached.has_iucn || !cachedResult.wikiDetails;
}

function mergeSpeciesCacheResults(
  cached: SpeciesCacheResult,
  fresh: SpeciesCacheResult | null,
): SpeciesCacheResult {
  if (!fresh) return cached;

  return {
    image: fresh.image ?? cached.image,
    iucnCode: fresh.iucnCode ?? cached.iucnCode,
    iucnTrend: fresh.iucnTrend ?? cached.iucnTrend,
    iucnYear: fresh.iucnYear ?? cached.iucnYear,
    wikiDetails: fresh.wikiDetails ?? cached.wikiDetails,
    genusDetails: fresh.genusDetails ?? cached.genusDetails,
  };
}

async function fetchFreshSpeciesCache({
  gbifKey,
  canonicalName,
  genusName,
  family,
  lang,
  base,
  existingDescriptionPt,
  existingHasDescription,
}: FetchFreshParams): Promise<SpeciesCacheResult> {
  const shouldFetchImage = !base?.image;
  const shouldFetchIucn = !base?.iucnCode;
  const [
    iNatResult,
    wikiImgResult,
    wikiDetailResult,
    iucnResult,
    genusResult,
  ] = await Promise.allSettled([
    shouldFetchImage
      ? getSpecieImageFromINaturalist({ canonicalName })
      : Promise.resolve(null),
    shouldFetchImage
      ? getSpecieImageFromWikipedia({ canonicalName })
      : Promise.resolve(null),
    fetchDescriptionWithFallback(canonicalName, lang, true),
    shouldFetchIucn
      ? getSpeciesStatusFromIUCN(canonicalName)
      : Promise.resolve(null),
    genusName
      ? fetchDescriptionWithFallback(genusName, lang, true)
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
  if (shouldFetchImage && !image) {
    try {
      const gbifImg = await getSpecieImageFromGBIF({ specieKey: gbifKey });
      image = gbifImg ?? null;
    } catch {
      //
    }
  }

  const description = wikiDetails?.extract ?? wikiDetails?.description ?? null;
  const baseDescription =
    base?.wikiDetails?.extract ?? base?.wikiDetails?.description ?? null;
  const finalImage = image
    ? {
        imgUrl: image.imgUrl,
        source: image.source,
        licenseCode: image.licenseCode ?? "",
        author: image.author ?? "",
      }
    : base?.image ?? null;
  const finalIucnCode = iucn?.code ?? base?.iucnCode ?? null;
  const finalIucnTrend = iucn?.trend ?? base?.iucnTrend ?? null;
  const finalIucnYear = iucn?.year ?? base?.iucnYear ?? null;
  const finalDescription = description ?? baseDescription;
  const expires_at = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const descriptionPt =
    lang === "pt"
      ? finalDescription
      : (existingDescriptionPt ?? null);
  const hasPersistedDescription =
    lang === "pt"
      ? !!descriptionPt
      : (existingHasDescription ?? !!descriptionPt);

  void upsertSpeciesCache({
    gbif_key: gbifKey,
    scientific_name: canonicalName,
    image_url: finalImage?.imgUrl ?? null,
    image_source: finalImage?.source ?? null,
    image_attribution: finalImage?.author ?? null,
    image_license: finalImage?.licenseCode ?? null,
    iucn_code: finalIucnCode,
    iucn_population_trend: finalIucnTrend,
    iucn_assessment_year: finalIucnYear,
    description_pt: descriptionPt,
    description_source: null,
    vernacular_names: null,
    family: family ?? null,
    expires_at,
    has_image: !!finalImage,
    has_iucn: finalIucnCode !== null,
    has_description: hasPersistedDescription,
  });

  return {
    image: finalImage,
    iucnCode: finalIucnCode,
    iucnTrend: finalIucnTrend,
    iucnYear: finalIucnYear,
    wikiDetails: wikiDetails ?? base?.wikiDetails ?? null,
    genusDetails: genusDetails ?? base?.genusDetails ?? null,
  };
}

export const useGetSpeciesCache = (
  gbifKey: number | undefined,
  canonicalName: string | undefined,
  genusName?: string,
  family?: string,
) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) ?? "pt";
  const queryClient = useQueryClient();
  const queryKey = [
    QUERY_KEYS.species_cache_key,
    gbifKey,
    lang,
    "localized-v2",
  ] as const;

  return useQuery<SpeciesCacheResult | null>({
    queryKey,
    queryFn: async (): Promise<SpeciesCacheResult | null> => {
      if (!gbifKey || !canonicalName) return null;

      const cached = await getSpeciesCache(gbifKey);

      if (cached) {
        const cachedResult = buildCachedResult(cached, lang);
        const freshParams = {
          gbifKey,
          canonicalName,
          genusName,
          family,
          lang,
          base: cachedResult,
          existingDescriptionPt: cached.description_pt,
          existingHasDescription: cached.has_description,
        };

        if (!cachedResult.wikiDetails) {
          const fresh = await fetchFreshSpeciesCache(freshParams);
          return mergeSpeciesCacheResults(cachedResult, fresh);
        }

        if (shouldRefreshCachedSpecies(cached, cachedResult)) {
          void fetchFreshSpeciesCache(freshParams).then((fresh) => {
            queryClient.setQueryData(
              queryKey,
              mergeSpeciesCacheResults(cachedResult, fresh),
            );
          });
        }

        return cachedResult;
      }

      return await fetchFreshSpeciesCache({
        gbifKey,
        canonicalName,
        genusName,
        family,
        lang,
      });
    },
    enabled: !!gbifKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24 * 30,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
};
