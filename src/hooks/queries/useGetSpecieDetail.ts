import { useQuery } from "@tanstack/react-query";
import { getSpecieDetail } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { SpecieDetail } from "@/common/types/api";

type UseGetSpecieDetail = {
  specieKey: number | null | undefined;
  enabled?: boolean;
};

export const useGetSpecieDetail = ({
  specieKey,
  enabled = true,
}: UseGetSpecieDetail) => {
  const { specie_key } = QUERY_KEYS;
  const hasValidSpecieKey =
    typeof specieKey === "number" && Number.isFinite(specieKey) && specieKey > 0;
  const validSpecieKey = hasValidSpecieKey ? specieKey : null;

  return useQuery<SpecieDetail>({
    queryKey: [specie_key, specieKey ?? null],
    queryFn: async () => {
      if (validSpecieKey === null) {
        throw new Error("A valid species key is required.");
      }

      const data = await getSpecieDetail(validSpecieKey);

      return {
        canonicalName: data.canonicalName,
        scientificName: data.scientificName,
        kingdom: data.kingdom,
        phylum: data.phylum,
        class: data.class,
        order: data.order,
        family: data.family,
        genus: data.genus,
        species: data.species,
        authorship: data.authorship,
        publishedIn: data.publishedIn,
        title: data.title,
      };
    },
    enabled: enabled && hasValidSpecieKey,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
