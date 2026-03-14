import { useGetSpeciesCache } from "./useGetSpeciesCache";

export const useGetSpecieImage = (
  specieKey?: number,
  canonicalName?: string,
) => {
  const { data: cache, isLoading } = useGetSpeciesCache(
    specieKey,
    canonicalName,
  );

  return {
    data: cache?.image ?? null,
    isLoading,
  };
};
