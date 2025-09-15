export type Rank =
  | "KINGDOM"
  | "PHYLUM"
  | "CLASS"
  | "ORDER"
  | "FAMILY"
  | "GENUS"
  | "SPECIES";

export type Kingdom =
  | "animalia"
  | "archaea"
  | "bacteria"
  | "chromista"
  | "fungi"
  | "protozoa"
  | "plantae";

export interface Taxon {
  key: number;
  scientificName: string;
  rank: Rank;
  kingdom: Kingdom;
  canonicalName: string;
  numDescendants: number;
  phylum: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
}

export type RootTaxonNode = Pick<Taxon, "key" | "rank" | "numDescendants"> & {
  color: string;
};

export type SpecieDetail = {
  canonicalName: string;
  scientificName: string;
  kingdom: Kingdom;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  authorship: string;
  publishedIn: string;
  title: string;
};
