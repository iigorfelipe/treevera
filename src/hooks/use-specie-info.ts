import { useGetSpecieDetail } from "./queries/useGetSpecieDetail";

/**
 * @returns Nome científico e família
 */
export const useSpecieInfo = (specieKey: number | undefined) => {
  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  return {
    specieName:
      specieDetail?.canonicalName || specieDetail?.scientificName || "—",
    familyName: specieDetail?.family || "—",
    isLoading,
  };
};
