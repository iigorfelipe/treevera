import { useQuery } from "@tanstack/react-query";
import { getOccurrence } from "@/services/apis/gbif";

const SAMPLE_OCCURRENCE_TARGET = 50;
const PRIORITY_COUNTRY_SAMPLE_LIMIT = 5;

export type OccurrenceMedia = {
  identifier: string;
  creator: string;
  rightsHolder: string;
  license: string;
  publisher: string;
  references: string;
};

export type Occurrences = {
  decimalLatitude: number;
  decimalLongitude: number;
  eventDate: string;
  year: number | null;
  month: number | null;
  day: number | null;
  locality: string;
  stateProvince: string;
  country: string;
  continent: string;
  recordedBy: string;
  identifiedBy: string;
  references: string;
  basisOfRecord: string;
  gbifID: string;
  datasetName: string;
  individualCount: number | null;
  coordinateUncertaintyInMeters: number | null;
  photo: OccurrenceMedia | null;
};

type GbifOccurrenceMedia = {
  type?: string | null;
  identifier?: string | null;
  creator?: string | null;
  rightsHolder?: string | null;
  license?: string | null;
  publisher?: string | null;
  references?: string | null;
};

type GbifOccurrenceItem = {
  decimalLatitude?: number | null;
  decimalLongitude?: number | null;
  eventDate?: string | null;
  year?: number | null;
  month?: number | null;
  day?: number | null;
  locality?: string | null;
  stateProvince?: string | null;
  country?: string | null;
  continent?: string | null;
  recordedBy?: string | null;
  identifiedBy?: string | null;
  references?: string | null;
  basisOfRecord?: string | null;
  gbifID?: string | number | null;
  datasetName?: string | null;
  individualCount?: number | null;
  coordinateUncertaintyInMeters?: number | null;
  media?: GbifOccurrenceMedia[] | null;
};

const mapOccurrence = (item: GbifOccurrenceItem): Occurrences => {
  const stillImage = (item.media ?? []).find(
    (media) => media.type === "StillImage" && media.identifier,
  );

  return {
    decimalLatitude: item.decimalLatitude,
    decimalLongitude: item.decimalLongitude,
    eventDate: item.eventDate ?? null,
    year: item.year ?? null,
    month: item.month ?? null,
    day: item.day ?? null,
    locality: item.locality ?? null,
    stateProvince: item.stateProvince ?? null,
    country: item.country ?? null,
    continent: item.continent ?? null,
    recordedBy: item.recordedBy ?? null,
    identifiedBy: item.identifiedBy ?? null,
    references: item.references ?? null,
    basisOfRecord: item.basisOfRecord ?? null,
    gbifID: item.gbifID ? String(item.gbifID) : null,
    datasetName: item.datasetName ?? null,
    individualCount: item.individualCount ?? null,
    coordinateUncertaintyInMeters: item.coordinateUncertaintyInMeters ?? null,
    photo: stillImage
      ? {
          identifier: stillImage.identifier,
          creator: stillImage.creator ?? null,
          rightsHolder: stillImage.rightsHolder ?? null,
          license: stillImage.license ?? null,
          publisher: stillImage.publisher ?? null,
          references: stillImage.references ?? null,
        }
      : null,
  } as Occurrences;
};

const normalizeOccurrences = (items: GbifOccurrenceItem[]): Occurrences[] =>
  items
    .filter((item) => item.decimalLatitude && item.decimalLongitude)
    .map((item) => mapOccurrence(item));

const getOccurrenceKey = (occurrence: Occurrences) =>
  occurrence.gbifID ||
  [
    occurrence.decimalLatitude,
    occurrence.decimalLongitude,
    occurrence.country,
    occurrence.eventDate,
  ].join(":");

export const useGetOccurrences = (
  specieKey: number,
  priorityCountries: string[] = [],
) => {
  return useQuery({
    queryKey: ["occurrences", specieKey, priorityCountries],
    queryFn: async () => {
      const uniquePriorityCountries = [...new Set(priorityCountries)]
        .filter(Boolean)
        .slice(0, 7);

      const [priorityResponses, generalResponse] = await Promise.all([
        Promise.all(
          uniquePriorityCountries.map((country) =>
            getOccurrence(specieKey, {
              country,
              limit: PRIORITY_COUNTRY_SAMPLE_LIMIT,
            }),
          ),
        ),
        getOccurrence(specieKey, { limit: SAMPLE_OCCURRENCE_TARGET }),
      ]);

      const priorityOccurrences = priorityResponses.flatMap((response) =>
        normalizeOccurrences(response.results ?? []),
      );
      const generalOccurrences = normalizeOccurrences(
        generalResponse.results ?? [],
      );

      const seen = new Set<string>();
      const occurrences = [...priorityOccurrences, ...generalOccurrences]
        .filter((occurrence) => {
          const occurrenceKey = getOccurrenceKey(occurrence);
          if (seen.has(occurrenceKey)) return false;
          seen.add(occurrenceKey);
          return true;
        })
        .slice(0, SAMPLE_OCCURRENCE_TARGET);

      return {
        hasResults: occurrences.length > 0,
        occurrences,
      };
    },
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
