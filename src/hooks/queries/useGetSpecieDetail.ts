import { useQuery } from "@tanstack/react-query";
import { getSpecieDetail } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { SpecieDetail } from "@/common/types/api";

type UseGetSpecieDetail = {
  specieKey: number;
};

export const useGetSpecieDetail = ({ specieKey }: UseGetSpecieDetail) => {
  const { specie_key } = QUERY_KEYS;

  return useQuery<SpecieDetail>({
    queryKey: [specie_key, specieKey],
    queryFn: async () => {
      const data = await getSpecieDetail(specieKey);

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
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
};
