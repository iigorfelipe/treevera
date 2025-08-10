import animaliaUrl from "@/assets/images/avif-animalia.avif?url";
import archaeaUrl from "@/assets/images/avif-archaea.avif?url";
import bacteriaUrl from "@/assets/images/avif-bacteria.avif?url";
import chromistaUrl from "@/assets/images/avif-chromista.avif?url";
import fungiUrl from "@/assets/images/avif-fungi.avif?url";
import plantaeUrl from "@/assets/images/avif-plantae.avif?url";
import protozoaUrl from "@/assets/images/avif-protozoa.avif?url";
import virusesUrl from "@/assets/images/avif-viruses.avif?url";

import type { Kingdom, Rank, Taxon } from "../types/api";
import { capitalizar } from "./string";

export const RANK_ORDER: Rank[] = [
  "KINGDOM",
  "PHYLUM",
  "CLASS",
  "ORDER",
  "FAMILY",
  "GENUS",
  "SPECIES",
];

export function getNextRank(currentRank: string): Rank | null {
  const index = RANK_ORDER.indexOf(currentRank.toUpperCase() as Rank);

  if (index >= 0 && index < RANK_ORDER.length - 1) {
    return RANK_ORDER[index + 1];
  }
  return null;
}

export const RANK_FIXES: Record<string, string> = {
  Crocodylia: "Order",
  Squamata: "Order",
  Testudines: "Order",
  Sphenodontia: "Order",
};

export function getDisplayRank(taxon: Taxon) {
  const realRank = capitalizar(taxon.rank);
  const fixRank = RANK_FIXES[taxon.canonicalName || taxon.scientificName];

  if (fixRank && fixRank.toUpperCase() !== realRank.toUpperCase()) {
    return {
      name: fixRank,
      icon: true,
    };
  }

  return {
    name: realRank,
    icon: false,
  };
}

export const getRankIcon = (rank: Kingdom) => {
  switch (rank.toLowerCase()) {
    case "animalia":
      return animaliaUrl;
    case "archaea":
      return archaeaUrl;
    case "bacteria":
      return bacteriaUrl;
    case "chromista":
      return chromistaUrl;
    case "fungi":
      return fungiUrl;
    case "plantae":
      return plantaeUrl;
    case "protozoa":
      return protozoaUrl;
    case "viruses":
      return virusesUrl;
    default:
      return plantaeUrl;
  }
};
