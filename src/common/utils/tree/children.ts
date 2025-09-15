import type { Rank, Taxon } from "@/common/types/api";
import { getNextRank } from "./ranks";

export const filterChildrenByRank = (rank: Rank, children?: Taxon[]) => {
  if (!children) return [];

  const nextRank = getNextRank(rank);

  const result = children.filter(
    (child) => child.rank.toLowerCase() === nextRank?.toLowerCase(),
  );

  if (result.length === 0 && children.length > 0) {
    console.warn(
      `Rank inconsistente detectado para '${rank}' (esperado: ${nextRank}, encontrados: ${[
        ...new Set(children.map((c) => c.rank)),
      ].join(", ")})`,
    );

    return children;
  }

  return result;
};
