import type { SpecieDetail, Taxon } from "@/common/types/api";

const GBIF_BASE_URL = "https://api.gbif.org/v1";
const SPECIES_URL = `${GBIF_BASE_URL}/species`;
const KINGDOM_URL = `${SPECIES_URL}/search?rank=KINGDOM&status=ACCEPTED&limit=100&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c`;

export const getKingdoms = async () => {
  const res = await fetch(KINGDOM_URL);
  const data = await res.json();
  return data.results as Taxon[];
};

export const getChildren = async (parentKey: number) => {
  const url = `${SPECIES_URL}/${parentKey}/children?limit=1000&status=ACCEPTED`; // aumentei o limit para 1000 pois menor que isso trazia dados repetidos
  const data = await fetch(url).then((res) => res.json());
  return data.results as Taxon[];
};

export const getSpecieDetail = async (key: number) => {
  const url = `${SPECIES_URL}/${key}`;
  const data = await fetch(url).then((res) => res.json());
  return data as SpecieDetail;
};

type Params = { specieKey: number };
export const getSpecieImageFromGBIF = async ({ specieKey }: Params) => {
  const url = `https://api.gbif.org/v1/occurrence/search?mediaType=StillImage&taxon_key=${specieKey}&limit=1`;

  const data = await fetch(url).then((res) => res.json());
  const gbifImage = data.results?.[0]?.media?.[0]?.identifier;

  if (!gbifImage) return null;

  return {
    source: "GBIF",
    imgUrl: gbifImage,
    licenseCode: "",
    author: "",
  };
};

// *****************************************************************************************************

export const getSpeciesMatch = async (
  name: string,
  kingdom?: string,
): Promise<Taxon | null> => {
  let url = `${SPECIES_URL}/match?name=${encodeURIComponent(name)}&strict=false`;
  if (kingdom) url += `&kingdom=${encodeURIComponent(kingdom)}`;

  const data = await fetch(url).then((res) => res.json());

  if (!data || data.matchType === "NONE" || !data.usageKey) return null;

  return {
    key: data.usageKey as number,
    scientificName: (data.scientificName as string) ?? "",
    canonicalName: (data.canonicalName as string) ?? "",
    rank: (data.rank as Taxon["rank"]) ?? "SPECIES",
    kingdom: (data.kingdom as Taxon["kingdom"]) ?? "animalia",
    numDescendants: 0,
    phylum: (data.phylum as string) ?? "",
    class: data.class as string | undefined,
    order: data.order as string | undefined,
    family: data.family as string | undefined,
    genus: data.genus as string | undefined,
  } as Taxon;
};

export const searchTaxa = async (q: string, kingdom?: string) => {
  let url = `${SPECIES_URL}/search?q=${encodeURIComponent(q)}&status=ACCEPTED&limit=50`;
  if (kingdom) {
    url += `&kingdom=${encodeURIComponent(kingdom)}`;
  }

  const data = await fetch(url).then((res) => res.json());
  const results = (data.results ?? []) as Taxon[];

  return results;
};

export const getParents = async (key: number) => {
  const url = `${SPECIES_URL}/${key}/parents`;
  const data = await fetch(url).then((res) => res.json());
  return (data ?? []) as Taxon[];
};

// ## TODO: buscar ocorrencias e traduções

const OCCURRENCE_URL = `${GBIF_BASE_URL}/occurrence`;

// export const getSpecieBySuggestName = async (suggestName: string) => {
//   const url = `${SPECIES_URL}/suggest?q=${suggestName}&limit=1`;
//   const data = await fetch(url).then((res) => res.json());
//   return data;
// };

// export const getVernacularNames = async (key: number) => {
//   const url = `${SPECIES_URL}/${key}/vernacularNames`;
//   const data = await fetch(url).then((res) => res.json());
//   return data.json();
// };
// Tem language (ex: "pt", "es", "en")
// Tem source (ex: "ITIS", "COL", etc.)

export const getOccurrence = async (key: number) => {
  const url = `${OCCURRENCE_URL}/search?taxonKey=${key}`;
  const data = await fetch(url).then((res) => res.json());
  return data;
};
// Resposta tem country, decimalLatitude, decimalLongitude
// Mesmo taxonKey do species

// export type IucnRedListCategory = {
//   category: string; // "ENDANGERED",
//   usageKey: number; // 258100097,
//   scientificName: string; // "Allophryne relicta Caramaschi, Orrico, Faivovich, Dias & Solé, 2013",
//   taxonomicStatus: string; // "ACCEPTED",
//   iucnTaxonID: number; // "77187618",
//   code: StatusCode; // "EN"
// };

// export const getIucnRedListCategory = async (key: number) => {
//   const url = `${SPECIES_URL}/${key}/iucnRedListCategory`
//   const data = await fetch(url).then((res) => res.json());
//   return data as IucnRedListCategory;
// };
// "category": "ENDANGERED",
// "usageKey": 258100097,
// "scientificName": "Allophryne relicta Caramaschi, Orrico, Faivovich, Dias & Solé, 2013",
// "taxonomicStatus": "ACCEPTED",
// "iucnTaxonID": "77187618",
// "code": "EN"
