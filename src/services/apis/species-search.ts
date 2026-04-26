import type { Taxon } from "@/common/types/api";
import { getSpeciesMatch, searchTaxa } from "./gbif";
import { getWikiSpecieDetail } from "./wikipedia";

const WIKIPEDIA_LANGUAGES = ["pt", "en", "es"] as const;
const SPECIES_RANK_ITEM = "Q7432";

type WikidataEntityResponse = {
  entities?: Record<
    string,
    {
      claims?: {
        P105?: Array<{
          mainsnak?: {
            datavalue?: {
              value?: {
                id?: string;
              };
            };
          };
        }>;
        P225?: Array<{
          mainsnak?: {
            datavalue?: {
              value?: string;
            };
          };
        }>;
      };
    }
  >;
};

type WikipediaSearchResponse = {
  query?: {
    search?: Array<{
      title?: string;
    }>;
  };
};

function getLanguageOrder(preferredLanguage?: string) {
  const preferred = preferredLanguage?.toLowerCase().split("-")[0];
  return Array.from(
    new Set([preferred, ...WIKIPEDIA_LANGUAGES].filter(Boolean)),
  ) as string[];
}

export function isHyphenatedCommonNameQuery(query: string) {
  return /\p{L}+-\p{L}+/u.test(query.trim());
}

async function getScientificNameFromWikidataItem(itemId: string) {
  if (!/^Q\d+$/.test(itemId)) return null;

  const res = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${itemId}.json`,
  );
  if (!res.ok) return null;

  const data = (await res.json()) as WikidataEntityResponse;
  const claims = data.entities?.[itemId]?.claims;
  const rankId = claims?.P105?.[0]?.mainsnak?.datavalue?.value?.id;
  const scientificName = claims?.P225?.[0]?.mainsnak?.datavalue?.value;

  if (rankId && rankId !== SPECIES_RANK_ITEM) return null;
  return typeof scientificName === "string" ? scientificName : null;
}

async function getScientificNameFromWikipediaPage(
  title: string,
  language: string,
) {
  const wikiData = await getWikiSpecieDetail(title, language);
  const wikibaseItem = wikiData?.wikibase_item;

  if (typeof wikibaseItem !== "string") return null;

  return getScientificNameFromWikidataItem(wikibaseItem);
}

async function getScientificNameFromWikipedia(
  query: string,
  preferredLanguage?: string,
) {
  for (const language of getLanguageOrder(preferredLanguage)) {
    const scientificName = await getScientificNameFromWikipediaPage(
      query,
      language,
    );
    if (scientificName) return scientificName;
  }

  return null;
}

async function getSpeciesFromScientificName(
  scientificName: string | null,
  kingdom?: string,
) {
  if (!scientificName) return null;

  const match = await getSpeciesMatch(scientificName, kingdom);
  if (!match || match.rank !== "SPECIES") return null;

  return match;
}

async function searchWikipediaSpecies(
  query: string,
  preferredLanguage?: string,
) {
  for (const language of getLanguageOrder(preferredLanguage)) {
    const res = await fetch(
      `https://${language}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query,
      )}&format=json&origin=*&srlimit=8`,
    );
    if (!res.ok) continue;

    const data = (await res.json()) as WikipediaSearchResponse;
    const titles = data.query?.search?.map((result) => result.title) ?? [];

    for (const title of titles) {
      if (!title) continue;

      const scientificName = await getScientificNameFromWikipediaPage(
        title,
        language,
      );
      if (scientificName) return scientificName;
    }
  }

  return null;
}

async function resolveExactCommonNameSpecies(
  query: string,
  kingdom?: string,
  preferredLanguage?: string,
) {
  const scientificName = await getScientificNameFromWikipedia(
    query,
    preferredLanguage,
  );

  return getSpeciesFromScientificName(scientificName, kingdom);
}

async function resolveSearchedCommonNameSpecies(
  query: string,
  kingdom?: string,
  preferredLanguage?: string,
) {
  const scientificName = await searchWikipediaSpecies(query, preferredLanguage);

  return getSpeciesFromScientificName(scientificName, kingdom);
}

function normalizeSearchText(value?: string) {
  return value
    ?.normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function hasStrongTaxonomicSpeciesMatch(query: string, taxa: Taxon[]) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;

  return taxa.some((taxon) => {
    const scientificName = normalizeSearchText(taxon.scientificName);
    const canonicalName = normalizeSearchText(taxon.canonicalName);

    return [scientificName, canonicalName].some(
      (name) =>
        name === normalizedQuery || name?.startsWith(`${normalizedQuery} `),
    );
  });
}

function shouldSearchWikipediaFallback(query: string) {
  const trimmed = query.trim();
  const hasNonAsciiCharacter = Array.from(trimmed).some(
    (char) => (char.codePointAt(0) ?? 0) > 127,
  );

  return (
    isHyphenatedCommonNameQuery(trimmed) ||
    /\s/.test(trimmed) ||
    hasNonAsciiCharacter
  );
}

export async function searchTaxaByUserQuery(
  query: string,
  kingdom?: string,
  rank?: Taxon["rank"],
  preferredLanguage?: string,
): Promise<Taxon[]> {
  if (rank !== "SPECIES") return searchTaxa(query, kingdom, rank);

  const exactCommonNameMatch = await resolveExactCommonNameSpecies(
    query,
    kingdom,
    preferredLanguage,
  );
  if (exactCommonNameMatch) return [exactCommonNameMatch];

  const directMatches = await searchTaxa(query, kingdom, rank);
  if (hasStrongTaxonomicSpeciesMatch(query, directMatches)) {
    return directMatches;
  }

  if (shouldSearchWikipediaFallback(query)) {
    const searchedCommonNameMatch = await resolveSearchedCommonNameSpecies(
      query,
      kingdom,
      preferredLanguage,
    );
    if (searchedCommonNameMatch) return [searchedCommonNameMatch];
  }

  if (isHyphenatedCommonNameQuery(query)) return [];

  return directMatches;
}
