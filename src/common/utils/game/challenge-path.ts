import type { Rank, Taxon } from "@/common/types/api";

const SKIP_IN_CHALLENGE = new Set([
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

export const buildChallengePathFromParents = (
  parents: Taxon[],
  speciesCanonicalName: string,
): Array<{ rank: Rank; name: string }> => {
  const path = parents
    .filter((p) => !SKIP_IN_CHALLENGE.has(p.rank))
    .map((p) => ({
      rank: p.rank,
      name: p.canonicalName ?? p.scientificName ?? "",
    }));

  path.push({ rank: "SPECIES" as Rank, name: speciesCanonicalName });

  return path;
};
