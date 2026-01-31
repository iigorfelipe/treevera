import type { Rank } from "@/common/types/api";

export const dailySpecies = [
  "Homo sapiens",
  "Apis mellifera",
  "Manis culionensis",
  "Pestalotiopsis microspora",
  "Turritopsis dohrnii",
  "Mimosa pudica L.",
  "Halobacterium salinarum",
  "Deinococcus radiodurans",
  "Naegleria fowleri",
  "Phytophthora infestans",
  "Inia geoffrensis",
];

export const getDailySpecies = () => {
  // const start = new Date(date.getFullYear(), 0, 0);
  // const diff = date.getTime() - start.getTime();
  // const oneDay = 1000 * 60 * 60 * 24;
  // const dayOfYear = Math.floor(diff / oneDay);
  // const idx = dayOfYear % dailySpecies.length;
  // return dailySpecies[idx];
  return dailySpecies[0];
};

export const speciesPaths: Record<
  string,
  Array<{ rank: Rank; name: string }>
> = {
  "Homo sapiens": [
    { rank: "KINGDOM", name: "Animalia" },
    { rank: "PHYLUM", name: "Chordata" },
    { rank: "CLASS", name: "Mammalia" },
    { rank: "ORDER", name: "Primates" },
    { rank: "FAMILY", name: "Hominidae" },
    { rank: "GENUS", name: "Homo" },
    { rank: "SPECIES", name: "Homo sapiens" },
  ],
  "Apis mellifera": [
    { rank: "KINGDOM", name: "Animalia" },
    { rank: "PHYLUM", name: "Arthropoda" },
    { rank: "CLASS", name: "Insecta" },
    { rank: "ORDER", name: "Hymenoptera" },
    { rank: "FAMILY", name: "Apidae" },
    { rank: "GENUS", name: "Apis" },
    { rank: "SPECIES", name: "Apis mellifera" },
  ],
  "Manis culionensis": [
    { rank: "KINGDOM", name: "Animalia" },
    { rank: "PHYLUM", name: "Chordata" },
    { rank: "CLASS", name: "Mammalia" },
    { rank: "ORDER", name: "Pholidota" },
    { rank: "FAMILY", name: "Manidae" },
    { rank: "GENUS", name: "Manis" },
    { rank: "SPECIES", name: "Manis culionensis" },
  ],
  "Pestalotiopsis microspora": [
    { rank: "KINGDOM", name: "Fungi" },
    { rank: "PHYLUM", name: "Ascomycota" },
    { rank: "CLASS", name: "Sordariomycetes" },
    { rank: "ORDER", name: "Xylariales" },
    { rank: "FAMILY", name: "Amphisphaeriaceae" },
    { rank: "GENUS", name: "Pestalotiopsis" },
    { rank: "SPECIES", name: "Pestalotiopsis microspora" },
  ],
  "Turritopsis dohrnii": [
    { rank: "KINGDOM", name: "Animalia" },
    { rank: "PHYLUM", name: "Cnidaria" },
    { rank: "CLASS", name: "Hydrozoa" },
    { rank: "ORDER", name: "Anthoathecata" },
    { rank: "FAMILY", name: "Oceaniidae" },
    { rank: "GENUS", name: "Turritopsis" },
    { rank: "SPECIES", name: "Turritopsis dohrnii" },
  ],
  "Mimosa pudica L.": [
    { rank: "KINGDOM", name: "Plantae" },
    { rank: "PHYLUM", name: "Tracheophyta" },
    { rank: "CLASS", name: "Magnoliopsida" },
    { rank: "ORDER", name: "Fabales" },
    { rank: "FAMILY", name: "Fabaceae" },
    { rank: "GENUS", name: "Mimosa" },
    { rank: "SPECIES", name: "Mimosa pudica" },
  ],
  "Halobacterium salinarum": [
    { rank: "KINGDOM", name: "Archaea" },
    { rank: "PHYLUM", name: "Euryarchaeota" },
    { rank: "CLASS", name: "Halobacteria" },
    { rank: "ORDER", name: "Halobacteriales" },
    { rank: "FAMILY", name: "Halobacteriaceae" },
    { rank: "GENUS", name: "Halobacterium" },
    { rank: "SPECIES", name: "Halobacterium salinarum" },
  ],
  "Deinococcus radiodurans": [
    { rank: "KINGDOM", name: "Bacteria" },
    { rank: "PHYLUM", name: "Deinococcota" },
    { rank: "CLASS", name: "Deinococci" },
    { rank: "ORDER", name: "Deinococcales" },
    { rank: "FAMILY", name: "Deinococcaceae" },
    { rank: "GENUS", name: "Deinococcus" },
    { rank: "SPECIES", name: "Deinococcus radiodurans" },
  ],
  "Naegleria fowleri": [
    { rank: "KINGDOM", name: "Protozoa" },
    { rank: "PHYLUM", name: "Percolozoa" },
    { rank: "CLASS", name: "Heterolobosea" },
    { rank: "ORDER", name: "Schizopyrenida" },
    { rank: "FAMILY", name: "Vahlkampfiidae" },
    { rank: "GENUS", name: "Naegleria" },
    { rank: "SPECIES", name: "Naegleria fowleri" },
  ],
  "Phytophthora infestans": [
    { rank: "KINGDOM", name: "Chromista" },
    { rank: "PHYLUM", name: "Oomycota" },
    { rank: "CLASS", name: "Oomycetes" },
    { rank: "ORDER", name: "Peronosporales" },
    { rank: "FAMILY", name: "Peronosporaceae" },
    { rank: "GENUS", name: "Phytophthora" },
    { rank: "SPECIES", name: "Phytophthora infestans" },
  ],
  "Inia geoffrensis": [
    { rank: "KINGDOM", name: "Animalia" },
    { rank: "PHYLUM", name: "Chordata" },
    { rank: "CLASS", name: "Mammalia" },
    { rank: "ORDER", name: "Cetartiodactyla" },
    { rank: "FAMILY", name: "Iniidae" },
    { rank: "GENUS", name: "Inia" },
    { rank: "SPECIES", name: "Inia geoffrensis" },
  ],
};
