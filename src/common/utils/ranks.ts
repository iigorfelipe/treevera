import type { Rank } from "../types/api";

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
  return index >= 0 && index < RANK_ORDER.length - 1
    ? RANK_ORDER[index + 1]
    : null;
}

export const getRankIcon = (rank: string) => {
  switch (rank.toLowerCase()) {
    case "animalia":
      return "/assets/animalia.png";
    case "archaea":
      return "/assets/archaea.png";
    case "bacteria":
      return "/assets/bacteria.png";
    case "chromista":
      return "/assets/chromista.png";
    case "fungi":
      return "/assets/fungi.png";
    case "plantae":
      return "/assets/plantae.png";
    case "protozoa":
      return "/assets/protozoa.png";
    case "viruses":
      return "/assets/viruses.png";
    default:
      return "/assets/plantae.png";
  }
};
