export type Rank =
  | "DOMAIN"
  | "KINGDOM"
  | "SUBKINGDOM"
  | "SUPERPHYLUM"
  | "PHYLUM"
  | "SUBPHYLUM"
  | "INFRAPHYLUM"
  | "SUPERCLASS"
  | "CLASS"
  | "SUBCLASS"
  | "INFRACLASS"
  | "PARVCLASS"
  | "MAGNORDER"
  | "SUPERORDER"
  | "ORDER"
  | "SUBORDER"
  | "INFRAORDER"
  | "PARVORDER"
  | "SUPERFAMILY"
  | "FAMILY"
  | "SUBFAMILY"
  | "INFRAFAMILY"
  | "TRIBE"
  | "SUBTRIBE"
  | "GENUS"
  | "SUBGENUS"
  | "SECTION"
  | "SUBSECTION"
  | "SPECIES"
  | "SUBSPECIES"
  | "VARIETY"
  | "SUBVARIETY"
  | "FORM"
  | "SUBFORM"
  | "CULTIVAR_GROUP"
  | "CULTIVAR"
  | "STRAIN"
  | "UNRANKED";

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
  nubKey?: number;
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

export type VernacularName = {
  vernacularName: string;
  language: string;
  source: string;
};

export type SpecieDetail = {
  key?: number;
  nubKey?: number;
  usageKey?: number;
  canonicalName: string;
  scientificName: string;
  rank?: Rank;
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
  numDescendants?: number;
};

export type CustomChallengeTaxonomy = {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
};

export type UserCustomChallenge = {
  id: string;
  user_id: string;
  gbif_key: number;
  species_name: string;
  family_name: string;
  taxonomy: CustomChallengeTaxonomy;
  active: boolean;
  created_at: string;
};
