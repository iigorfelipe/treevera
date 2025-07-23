import { useQuery } from "@tanstack/react-query";
import { getSpecieImage } from "@/services/api";

export const useGetSpecieImage = (
  specieKey?: number,
  canonicalName?: string,
) => {
  return useQuery({
    queryKey: ["specie-image", specieKey],
    queryFn: () =>
      getSpecieImage({ specieKey: specieKey!, canonicalName: canonicalName! }),
    enabled: !!specieKey && !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24,
  });
};
