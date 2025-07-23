import { useQuery } from "@tanstack/react-query";

export type TaxonomicRank =
  | "KINGDOM"
  | "PHYLUM"
  | "CLASS"
  | "ORDER"
  | "FAMILY"
  | "GENUS"
  | "SPECIES";

export interface TaxonInfo {
  key: number;
  parentKey?: number;
  rank: TaxonomicRank;
  scientificName: string;
  canonicalName?: string;
}

const TAXONOMIC_RANKS: { key: keyof MatchResult; rank: TaxonomicRank }[] = [
  { key: "kingdomKey", rank: "KINGDOM" },
  { key: "phylumKey", rank: "PHYLUM" },
  { key: "classKey", rank: "CLASS" },
  { key: "orderKey", rank: "ORDER" },
  { key: "familyKey", rank: "FAMILY" },
  { key: "genusKey", rank: "GENUS" },
  { key: "speciesKey", rank: "SPECIES" },
];

interface MatchResult {
  [key: string]: any;
  kingdomKey?: number;
  phylumKey?: number;
  classKey?: number;
  orderKey?: number;
  familyKey?: number;
  genusKey?: number;
  speciesKey?: number;
}

const fetchTaxonomy = async (name: string): Promise<TaxonInfo[]> => {
  const matchRes = await fetch(
    `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}`,
  );
  const matchData: MatchResult = await matchRes.json();

  const filteredKeys = TAXONOMIC_RANKS.filter(({ key }) => matchData[key]);

  const results = await Promise.all(
    filteredKeys.map(async ({ key, rank }) => {
      const id = matchData[key];
      const res = await fetch(`https://api.gbif.org/v1/species/${id}`);
      const data = await res.json();

      return {
        key: data.key,
        parentKey: data.parentKey,
        rank,
        scientificName: data.scientificName,
        canonicalName: data.canonicalName,
      } satisfies TaxonInfo;
    }),
  );

  return results;
};

export function useTaxonomy(name: string) {
  return useQuery({
    queryKey: ["taxonomy", name],
    queryFn: () => fetchTaxonomy(name),
    enabled: !!name,
  });
}
