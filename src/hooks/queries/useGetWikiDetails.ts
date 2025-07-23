import { useQuery } from "@tanstack/react-query";
import { getWikiSpecieDetail } from "@/services/api";

export const useGetWikiDetails = (canonicalName?: string) => {
  return useQuery({
    queryKey: ["wiki-details", canonicalName],
    queryFn: () => getWikiSpecieDetail(canonicalName!),
    enabled: !!canonicalName,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
};
