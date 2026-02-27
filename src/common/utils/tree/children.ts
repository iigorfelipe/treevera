import type { Taxon } from "@/common/types/api";

export const EXCLUDED_RANKS = new Set([
  "SUBSPECIES",
  "VARIETY",
  "SUBVARIETY",
  "FORM",
  "SUBFORM",
  "CULTIVAR_GROUP",
  "CULTIVAR",
  "STRAIN",
  "UNRANKED",
]);

export const filterChildren = (children?: Taxon[]): Taxon[] => {
  if (!children) return [];
  return children.filter((child) => !EXCLUDED_RANKS.has(child.rank));
};
