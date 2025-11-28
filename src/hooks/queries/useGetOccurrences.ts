import { useQuery } from "@tanstack/react-query";
import { getOccurrence } from "@/services/apis/gbif";

export type Occurrences = {
  decimalLatitude: number;
  decimalLongitude: number;
  eventDate: string;
  locality: string;
  country: string;
  recordedBy: string;
  references: string;
};

export const useGetOccurrences = (specieKey: number) => {
  return useQuery({
    queryKey: ["occurrences", specieKey],
    queryFn: async () => {
      const data = await getOccurrence(specieKey);

      const occurrences = data.results
        .filter((i: Occurrences) => i.decimalLatitude && i.decimalLongitude)
        .map((i: Occurrences) => ({
          decimalLatitude: i.decimalLatitude,
          decimalLongitude: i.decimalLongitude,
          eventDate: i.eventDate,
          locality: i.locality,
          country: i.country,
          recordedBy: i.recordedBy,
          references: i.references,
        })) as Occurrences[];

      return {
        hasResults: occurrences.length > 0,
        occurrences,
      };
    },
    staleTime: 1000 * 60 * 15,
  });
};
