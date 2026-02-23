import type { Taxon } from "@/common/types/api";

const BELOW_SPECIES_RANKS = new Set([
  "SUBSPECIES",
  "VARIETY",
  "SUBVARIETY",
  "FORM",
  "SUBFORM",
  "CULTIVAR_GROUP",
  "CULTIVAR",
  "STRAIN",
]);

export const filterChildren = (children?: Taxon[]): Taxon[] => {
  if (!children) return [];
  return children.filter((child) => !BELOW_SPECIES_RANKS.has(child.rank));
};
