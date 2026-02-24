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
  speciesKey: number,
): Array<{ rank: Rank; name: string; key: number }> => {
  const path = parents
    .filter((p) => !SKIP_IN_CHALLENGE.has(p.rank))
    .map((p) => ({
      rank: p.rank,
      name: p.canonicalName ?? p.scientificName ?? "",
      key: p.key,
    }));

  path.push({ rank: "SPECIES" as Rank, name: speciesCanonicalName, key: speciesKey });

  return path;
};
