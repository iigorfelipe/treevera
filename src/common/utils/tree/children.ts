import type { Rank, Taxon } from "@/common/types/api";

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

const MAIN_RANK_INDEX: Partial<Record<Rank, number>> = {
  KINGDOM: 0,
  PHYLUM: 1,
  CLASS: 2,
  ORDER: 3,
  FAMILY: 4,
  GENUS: 5,
  SPECIES: 6,
};

const MAX_RANK_GAP = 4;

export const filterChildren = (
  children?: Taxon[],
  parentRank?: Rank,
): Taxon[] => {
  if (!children) return [];
  return children.filter((child) => {
    if (EXCLUDED_RANKS.has(child.rank)) return false;

    if (parentRank) {
      const parentIdx = MAIN_RANK_INDEX[parentRank];
      const childIdx = MAIN_RANK_INDEX[child.rank];
      if (
        parentIdx !== undefined &&
        childIdx !== undefined &&
        childIdx - parentIdx > MAX_RANK_GAP
      ) {
        return false;
      }
    }

    return true;
  });
};
