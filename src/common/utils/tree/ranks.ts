import animaliaUrl from "@/assets/images/avif-animalia.avif?url";
import archaeaUrl from "@/assets/images/avif-archaea.avif?url";
import bacteriaUrl from "@/assets/images/avif-bacteria.avif?url";
import chromistaUrl from "@/assets/images/avif-chromista.avif?url";
import fungiUrl from "@/assets/images/avif-fungi.avif?url";
import plantaeUrl from "@/assets/images/avif-plantae.avif?url";
import protozoaUrl from "@/assets/images/avif-protozoa.avif?url";

import animalia1 from "@/assets/images/animalia-1.jpg?url";
import animalia2 from "@/assets/images/animalia-2.jpg?url";
import animalia3 from "@/assets/images/animalia-3.jpg?url";
import animalia4 from "@/assets/images/animalia-4.jpg?url";
import animalia5 from "@/assets/images/animalia-5.jpg?url";
import bacteria1 from "@/assets/images/bacteria-1.jpg?url";
import fungi1 from "@/assets/images/fungi-1.jpg?url";
import plantae1 from "@/assets/images/plantae-1.jpg?url";

import type { Kingdom, Rank, Taxon } from "../../types/api";
import { capitalizar } from "../string";

const KINGDOM_IMAGES: Record<Kingdom, string[]> = {
  animalia: [animalia1, animalia2, animalia3, animalia4, animalia5],
  bacteria: [bacteria1, bacteriaUrl],
  fungi: [fungi1, fungiUrl],
  plantae: [plantae1, plantaeUrl],
  archaea: [archaeaUrl],
  chromista: [chromistaUrl],
  protozoa: [protozoaUrl],
};

export const getKingdomImages = (kingdom: Kingdom): string[] =>
  KINGDOM_IMAGES[kingdom] ?? [animaliaUrl];

export const getBgImgByKingdom = (kingdom: Kingdom): string =>
  KINGDOM_IMAGES[kingdom][0];

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
