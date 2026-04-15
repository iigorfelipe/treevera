import { useQuery } from "@tanstack/react-query";
import { getOccurrenceStats } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";

export type CountryStat = {
  code: string;
  count: number;
  percentage: number;
};

export type RecordTypeStat = {
  type: string;
  count: number;
  percentage: number;
};

export type ProcessedOccurrenceStats = {
  total: number;
  topCountries: CountryStat[];
  recordTypes: RecordTypeStat[];
  latestYear: number | null;
};

export const useGetOccurrenceStats = (specieKey: number | null | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.occurrence_stats_key, specieKey],
    queryFn: async (): Promise<ProcessedOccurrenceStats> => {
      const raw = await getOccurrenceStats(specieKey!);
      const total = raw.total;

      const topCountries: CountryStat[] = raw.countries
        .slice(0, 7)
        .map((c) => ({
          code: c.name,
          count: c.count,
          percentage: total > 0 ? Math.round((c.count / total) * 100) : 0,
        }));

      const recordTypes: RecordTypeStat[] = raw.basisOfRecord.map((b) => ({
        type: b.name,
        count: b.count,
        percentage: total > 0 ? Math.round((b.count / total) * 100) : 0,
      }));

      const latestYear =
        raw.years.length > 0
          ? Math.max(
              ...raw.years.map((y) => parseInt(y.name, 10)).filter(Boolean),
            )
          : null;

      return { total, topCountries, recordTypes, latestYear };
    },
    enabled: !!specieKey,
    staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};
