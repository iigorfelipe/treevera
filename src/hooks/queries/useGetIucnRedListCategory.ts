import { getSpeciesStatusFromWikidata } from "@/services/apis/wikipedia";
import { useQuery } from "@tanstack/react-query";

export const useGetStatusCode = ({ specieName }: { specieName: string }) => {
  return useQuery({
    queryKey: ["iucn-status", specieName],
    queryFn: async () => await getSpeciesStatusFromWikidata(specieName),
    enabled: !!specieName,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
};
