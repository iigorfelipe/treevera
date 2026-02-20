import type { Rank } from "@/common/types/api";
import type { SpecieDetail } from "@/common/types/api";
import { capitalizar } from "@/common/utils/string";

export const buildChallengePathFromDetail = (
  detail: SpecieDetail,
): Array<{ rank: Rank; name: string }> => {
  return [
    { rank: "KINGDOM", name: capitalizar(detail.kingdom) },
    { rank: "PHYLUM", name: detail.phylum },
    { rank: "CLASS", name: detail.class },
    { rank: "ORDER", name: detail.order },
    { rank: "FAMILY", name: detail.family },
    { rank: "GENUS", name: detail.genus },
    { rank: "SPECIES", name: detail.species },
  ];
};
