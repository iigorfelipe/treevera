import animaliaUrl from "@/assets/images/avif-animalia.avif?url";
import archaeaUrl from "@/assets/images/avif-archaea.avif?url";
import bacteriaUrl from "@/assets/images/avif-bacteria.avif?url";
import chromistaUrl from "@/assets/images/avif-chromista.avif?url";
import fungiUrl from "@/assets/images/avif-fungi.avif?url";
import plantaeUrl from "@/assets/images/avif-plantae.avif?url";
import protozoaUrl from "@/assets/images/avif-protozoa.avif?url";

import type { Rank, Taxon } from "../../types/api";
import { capitalizar } from "../string";

export const RANK_ORDER: Rank[] = [
  "KINGDOM",
  "PHYLUM",
  "CLASS",
  "ORDER",
  "FAMILY",
  "GENUS",
  "SPECIES",
];

export const RANK_FIXES: Record<string, string> = {
  Crocodylia: "Order",
  Squamata: "Order",
  Testudines: "Order",
  Sphenodontia: "Order",
};

export const getDisplayRank = (taxon: Taxon) => {
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
};

export const getRankIcon = (kingdomKey: number) => {
  switch (kingdomKey) {
    case 1:
      return animaliaUrl;
    case 2:
      return archaeaUrl;
    case 3:
      return bacteriaUrl;
    case 4:
      return chromistaUrl;
    case 5:
      return fungiUrl;
    case 6:
      return plantaeUrl;
    case 7:
      return protozoaUrl;
    default:
      return plantaeUrl;
  }
};
