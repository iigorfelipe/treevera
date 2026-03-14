import { useGetSpeciesCache } from "./useGetSpeciesCache";

export const useGetWikiDetails = (
  canonicalName?: string,
  gbifKey?: number,
) => {
  const { data: cache, isLoading } = useGetSpeciesCache(gbifKey, canonicalName);

  return {
    data: cache?.wikiDetails ?? null,
    isLoading,
  };
};
