import type { Taxon } from "@/common/types/api";
import {
  isBackboneNode,
  type RawGbifChild,
} from "@/hooks/queries/useGetChildren";

const SKIP_RANKS = new Set([
  "SUBSPECIES",
  "VARIETY",
  "SUBVARIETY",
  "FORM",
  "SUBFORM",
  "UNRANKED",
  "CULTIVAR_GROUP",
  "CULTIVAR",
  "STRAIN",
]);

/**
 * Checks whether every node in a species' lineage would be visible
 * in the tree (i.e. passes isBackboneNode). The GBIF /parents response
 * includes extra fields (taxonomicStatus, origin, etc.) beyond the
 * Taxon type — we rely on those for the backbone check.
 */
export const validateChallengeParents = (parents: Taxon[]): boolean => {
  const pathParents = parents.filter((p) => !SKIP_RANKS.has(p.rank));
  return pathParents.every((p) =>
    isBackboneNode(p as unknown as RawGbifChild),
  );
};
