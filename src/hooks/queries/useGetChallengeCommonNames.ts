import { useQuery } from "@tanstack/react-query";

import type { VernacularName } from "@/common/types/api";
import {
  extractHighConfidenceWikipediaCommonNames,
  selectPrimaryCommonNames,
} from "@/common/utils/common-names";
import { getVernacularNames } from "@/services/apis/gbif";
import { getWikiSpecieDetail } from "@/services/apis/wikipedia";
import { QUERY_KEYS } from "./keys";

const WIKIPEDIA_LANGUAGES = ["pt", "en", "es"] as const;

async function getWikipediaCommonNames(
  canonicalName: string,
): Promise<VernacularName[]> {
  const results = await Promise.allSettled(
    WIKIPEDIA_LANGUAGES.map(async (language) => {
      const wikiData = await getWikiSpecieDetail(canonicalName, language);
      const commonNames = extractHighConfidenceWikipediaCommonNames({
        title: wikiData?.title,
        extractHtml: wikiData?.extract_html,
        extract: wikiData?.extract,
        description: wikiData?.description,
        language,
        canonicalName,
      });

      return commonNames.map((commonName) => ({
        vernacularName: commonName,
        language,
        source: "Wikipedia",
      }));
    }),
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
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
        canonicalName,
        "pt",
        { maxPerLanguage: 3 },
      );
      if (wikipediaNames.length > 0) return wikipediaNames;

      const gbifNames = await getVernacularNames(speciesKey, 100);
      return selectPrimaryCommonNames(gbifNames, canonicalName, "pt");
    },
    enabled: enabled && !!speciesKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}
