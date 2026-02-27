import { useQuery } from "@tanstack/react-query";
import { getVernacularNames } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { VernacularName } from "@/common/types/api";

const PRIORITY_LANGS = ["pt", "en", "es"];

export const useGetVernacularNames = (speciesKey: number) => {
  return useQuery<VernacularName[]>({
    queryKey: [QUERY_KEYS.vernacular_names_key, speciesKey],
    queryFn: async () => {
      const results = await getVernacularNames(speciesKey);

      const seen = new Set<string>();
      const deduped = results.filter((v) => {
        const k = `${v.language}::${v.vernacularName.toLowerCase()}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      const score = (v: VernacularName) => {
        if (!v.language) return 1000;
        const i = PRIORITY_LANGS.indexOf(v.language);
        return i === -1 ? 3 : i; // pt=0, en=1, es=2, outros nomeados=3
      };

      return deduped.sort((a, b) => score(a) - score(b));
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    enabled: !!speciesKey,
  });
};
