export type Rank =
  | "KINGDOM"
  | "PHYLUM"
  | "CLASS"
  | "ORDER"
  | "FAMILY"
  | "GENUS"
  | "SPECIES";

export interface Taxon {
  key: number;
  scientificName: string;
  rank: Rank;
  kingdom: string;
  canonicalName: string;
}
