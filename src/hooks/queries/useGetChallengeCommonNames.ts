import { useQuery } from "@tanstack/react-query";
import type { VernacularName } from "@/common/types/api";
import { getVernacularNames } from "@/services/apis/gbif";
import { getWikiSpecieDetail } from "@/services/apis/wikipedia";
import { QUERY_KEYS } from "./keys";

const WIKIPEDIA_LANGUAGES = ["pt", "en", "es"] as const;
const LANGUAGE_ALIASES: Record<string, string> = {
  por: "pt",
  eng: "en",
  spa: "es",
  esp: "es",
};

function getBaseLanguage(language?: string) {
  const base = language?.toLowerCase().split("-")[0] ?? "";
  return LANGUAGE_ALIASES[base] ?? base;
}

function getLanguagePriority(language?: string) {
  const base = getBaseLanguage(language);
  const index = WIKIPEDIA_LANGUAGES.indexOf(
    base as (typeof WIKIPEDIA_LANGUAGES)[number],
  );
  if (index !== -1) return index;
  return base ? WIKIPEDIA_LANGUAGES.length : WIKIPEDIA_LANGUAGES.length + 1;
}

function isSupportedLanguage(language?: string) {
  return getLanguagePriority(language) < WIKIPEDIA_LANGUAGES.length;
}

function normalizeComparable(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .trim()
    .toLowerCase();
}

function cleanCommonNameCandidate(value: string) {
  return value
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/["“”'.,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidCommonNameCandidate(candidate: string, canonicalName: string) {
  const clean = cleanCommonNameCandidate(candidate);
  if (clean.length < 3 || clean.length > 80) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(clean)) return false;
  return normalizeComparable(clean) !== normalizeComparable(canonicalName);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

function decodeHtmlEntities(value: string) {
  if (typeof document === "undefined") {
    return value
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function extractFirstBoldNameFromHtml(html: string, canonicalName: string) {
  const matches = html.matchAll(/<b[^>]*>(.*?)<\/b>/gi);

  for (const match of matches) {
    const candidate = cleanCommonNameCandidate(
      decodeHtmlEntities(stripHtml(match[1] ?? "")),
    );

    if (isValidCommonNameCandidate(candidate, canonicalName)) {
      return candidate;
    }
  }

  return null;
}

function getPrimaryNameCandidate(value: string, language: string) {
  const withoutArticle = value
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      language === "en"
        ? /^(?:the|a|an)\s+/i
        : language === "es"
          ? /^(?:el|la|los|las|un|una)\s+/i
          : /^(?:o|a|os|as|um|uma)\s+/i,
      "",
    );

  return cleanCommonNameCandidate(
    withoutArticle.split(
      /\s*(?:,|;|\(|\bou\b|\btamb[eé]m\b|\balso\b|\bor\b|\btambi[eé]n\b|\bo\b)\s*/i,
    )[0] ?? "",
  );
}

function extractNameFromDescription(
  text: string,
  language: string,
  canonicalName: string,
) {
  const firstSentence = text.replace(/\s+/g, " ").trim().split(/[.!?]/)[0];
  if (!firstSentence) return null;

  const verbPattern =
    language === "en"
      ? /\s+(?:is|are)\s+/i
      : language === "es"
        ? /\s+(?:es|son)\s+/i
        : /\s+(?:é|e|são|sao)\s+/i;
  const beforeVerb = firstSentence.split(verbPattern)[0] ?? firstSentence;
  const candidate = getPrimaryNameCandidate(beforeVerb, language);

  return candidate && isValidCommonNameCandidate(candidate, canonicalName)
    ? candidate
    : null;
}

function extractWikipediaCommonName(
  wikiData: {
    title?: string;
    extract?: string;
    description?: string;
    extract_html?: string;
  } | null,
  canonicalName: string,
  language: string,
) {
  if (!wikiData) return null;

  const titleCandidate = wikiData.title
    ? cleanCommonNameCandidate(wikiData.title)
    : "";
  if (
    titleCandidate &&
    isValidCommonNameCandidate(titleCandidate, canonicalName)
  ) {
    return titleCandidate;
  }

  const htmlCandidate = wikiData.extract_html
    ? extractFirstBoldNameFromHtml(wikiData.extract_html, canonicalName)
    : null;
  if (htmlCandidate) return htmlCandidate;

  return extractNameFromDescription(
    wikiData.extract || wikiData.description || "",
    language,
    canonicalName,
  );
}

async function getWikipediaCommonNames(
  canonicalName: string,
): Promise<VernacularName[]> {
  const results = await Promise.allSettled(
    WIKIPEDIA_LANGUAGES.map(async (language) => {
      const wikiData = await getWikiSpecieDetail(canonicalName, language);
      const commonName = extractWikipediaCommonName(
        wikiData,
        canonicalName,
        language,
      );

      const name: VernacularName | null = commonName
        ? {
            vernacularName: commonName,
            language,
            source: "Wikipedia",
          }
        : null;

      return name;
    }),
  );

  return results
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter((name): name is VernacularName => name !== null);
}

function normalizeGbifName(name: VernacularName): VernacularName {
  return {
    ...name,
    language: getBaseLanguage(name.language),
    source: name.source || "GBIF",
  };
}

function compareCommonNames(a: VernacularName, b: VernacularName) {
  return (
    getLanguagePriority(a.language) - getLanguagePriority(b.language) ||
    getBaseLanguage(a.language).localeCompare(getBaseLanguage(b.language)) ||
    a.vernacularName.localeCompare(b.vernacularName)
  );
}

function selectPrimaryCommonNames(names: VernacularName[]) {
  const seen = new Set<string>();
  const seenLanguages = new Set<string>();

  return names
    .map(normalizeGbifName)
    .filter((name) => isSupportedLanguage(name.language))
    .sort(compareCommonNames)
    .filter((name) => {
      const language = getBaseLanguage(name.language);
      if (seenLanguages.has(language)) return false;

      const normalizedName = normalizeComparable(name.vernacularName);
      if (!normalizedName) return false;

      const key = `${language}::${normalizedName}`;
      if (seen.has(key)) return false;

      seen.add(key);
      seenLanguages.add(language);
      return true;
    });
}

export function useGetChallengeCommonNames({
  speciesKey,
  canonicalName,
  enabled = true,
}: {
  speciesKey: number;
  canonicalName?: string;
  enabled?: boolean;
}) {
  return useQuery<VernacularName[]>({
    queryKey: [
      QUERY_KEYS.challenge_common_names_key,
      speciesKey,
      canonicalName,
    ],
    queryFn: async () => {
      if (!speciesKey || !canonicalName) return [];

      const wikipediaNames = selectPrimaryCommonNames(
        await getWikipediaCommonNames(canonicalName),
      );
      if (wikipediaNames.length > 0) return wikipediaNames;

      const gbifNames = await getVernacularNames(speciesKey, 100);
      return selectPrimaryCommonNames(gbifNames);
    },
    enabled: enabled && !!speciesKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}
