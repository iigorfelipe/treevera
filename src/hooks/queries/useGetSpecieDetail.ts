import { useQuery } from "@tanstack/react-query";
import { getSpecieDetail } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";

type UseGetSpecieDetail = {
  specieKey: number;
};

export function useGetSpecieDetail({ specieKey }: UseGetSpecieDetail) {
  const { specie_key } = QUERY_KEYS;

  return useQuery({
    queryKey: [specie_key, specieKey],
    queryFn: () => getSpecieDetail(specieKey),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}
