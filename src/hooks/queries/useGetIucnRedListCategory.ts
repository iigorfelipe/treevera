import { useGetSpeciesCache } from "./useGetSpeciesCache";

export const useGetStatusCode = ({
  gbifKey,
  specieName,
}: {
  gbifKey: number | undefined;
  specieName: string;
}) => {
  const { data: cache, isLoading } = useGetSpeciesCache(gbifKey, specieName);

  return {
    data: cache?.iucnCode ?? null,
    isLoading,
  };
};
