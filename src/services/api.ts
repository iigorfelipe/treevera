import type { SpecieDetail, Taxon } from "@/common/types/api";
import type { StatusCode } from "@/components/vulnerability-badge";

const GBIF_BASE_URL = "https://api.gbif.org/v1";
const SPECIES_URL = `${GBIF_BASE_URL}/species`;
const KINGDOM_URL = `${SPECIES_URL}/search?rank=KINGDOM&status=ACCEPTED&limit=100&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c`;

const OCCURRENCE_URL = `${GBIF_BASE_URL}/occurrence`; //Resposta tem country, decimalLatitude, decimalLongitude

const WIKI = `https://en.wikipedia.org/api/rest_v1/page/summary`;
const INATURALIST = `https://api.inaturalist.org/v1`;

// const IUCN_BASE_v3 = "https://apiv3.iucnredlist.org/api/v3";
// const IUCN_BASE_v4 = "https://apiv4.iucnredlist.org/api/v4";
const IUCN_BASE_v4 = "https://apiv4.iucn.org/api/v4";

export const getKingdoms = async () => {
  const res = await fetch(KINGDOM_URL);
  const data = await res.json();
  return data.results as Taxon[];
};

export const getChildren = async (parentKey: number) => {
  const res = await fetch(
    `${SPECIES_URL}/${parentKey}/children?limit=1000&status=ACCEPTED`,
  ); // necessário limit 1000 para trazer corretamente os nós!
  const data = await res.json();
  return data.results as Taxon[];
};

export const getSpecieDetail = async (key: number) => {
  const res = await fetch(`${SPECIES_URL}/${key}`);
  const data = await res.json();
  return data as SpecieDetail;
};

export const getSpecieBySuggestName = async (suggestName: string) => {
  const res = await fetch(`${SPECIES_URL}/suggest?q=${suggestName}&limit=1`);
  return await res.json();
};

// -------------

export const getVernacularNames = async (key: number) => {
  const res = await fetch(`${SPECIES_URL}/${key}/vernacularNames`);
  return await res.json();
  // Tem language (ex: "pt", "es", "en")
  // Tem source (ex: "ITIS", "COL", etc.)
};

export const getOccurrence = async (key: number) => {
  const res = await fetch(`${OCCURRENCE_URL}/search?taxonKey=${key}&limit=1`);
  return await res.json();
  // Resposta tem country, decimalLatitude, decimalLongitude
  // Mesmo taxonKey do species
};

export type IucnRedListCategory = {
  category: string; // "ENDANGERED",
  usageKey: number; // 258100097,
  scientificName: string; // "Allophryne relicta Caramaschi, Orrico, Faivovich, Dias & Solé, 2013",
  taxonomicStatus: string; // "ACCEPTED",
  iucnTaxonID: number; // "77187618",
  code: StatusCode; // "EN"
};

export const getIucnRedListCategory = async (key: number) => {
  const res = await fetch(`${SPECIES_URL}/${key}/iucnRedListCategory`);
  return (await res.json()) as IucnRedListCategory;
  // "category": "ENDANGERED",
  // "usageKey": 258100097,
  // "scientificName": "Allophryne relicta Caramaschi, Orrico, Faivovich, Dias & Solé, 2013",
  // "taxonomicStatus": "ACCEPTED",
  // "iucnTaxonID": "77187618",
  // "code": "EN"
};

export const getWikiSpecieDetail = async (name: string) => {
  const res = await fetch(`${WIKI}/${name}`);
  return await res.json();
};

// {
//   "result": [
//     {
//       "taxonid": 12345,
//       "scientific_name": "Panthera leo",
//       "category": "VU", // Vulnerable
//       ...
//     }
//   ]
// }

export async function getSpeciesIUCN(scientificName: string) {
  const url = `${IUCN_BASE_v4}/taxa/scientific_name/${encodeURIComponent(scientificName)}`;
  const token = import.meta.env.VITE_IUCN_TOKEN;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados da espécie:", error);
    throw error;
  }
}

const labelToCode: Record<string, StatusCode> = {
  Extinct: "EX",
  "Extinct in the Wild": "EW",
  "Critically Endangered": "CR",
  Endangered: "EN",
  Vulnerable: "VU",
  "Near Threatened": "NT",
  "Least Concern": "LC",
  "Data Deficient": "DD",
  "Not Evaluated": "NE",
};

export async function getSpeciesStatusFromWikidata(
  scientificName: string,
): Promise<StatusCode | null> {
  const query = `
    SELECT ?item ?itemLabel ?iucnStatus ?iucnStatusLabel WHERE {
      ?item wdt:P225 "${scientificName}".
      OPTIONAL { ?item wdt:P141 ?iucnStatus. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 1
  `;

  const endpoint = "https://query.wikidata.org/sparql";
  const url = endpoint + "?format=json&query=" + encodeURIComponent(query);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/sparql-results+json" },
    });

    if (!res.ok) throw new Error("Erro na requisição SPARQL");

    const data = await res.json();
    // console.log("Wikidata SPARQL Response:", data);
    const label = data?.results?.bindings?.[0]?.iucnStatusLabel?.value;
    // console.log("IUCN Status Label:", label);
    const code = labelToCode[label] ?? null;

    return code;
  } catch (err) {
    console.error("Erro ao buscar status na Wikidata:", err);
    return null;
  }
}

export const getSpecieImage = async ({
  specieKey,
  canonicalName,
}: {
  specieKey: number;
  canonicalName: string;
}) => {
  // 1. iNaturalist
  const inatSearch = await fetch(
    `${INATURALIST}/search?q=${encodeURIComponent(canonicalName)}&sources=taxa`,
  );
  const searchData = await inatSearch.json();
  // console.log("iNaturalist Search Data:", searchData);
  const taxon = searchData.results?.[0]?.record;
  if (taxon?.id) {
    const iNatTaxon = await fetch(`${INATURALIST}/taxa/${taxon.id}`);
    const taxonData = await iNatTaxon.json();
    // console.log("iNaturalist Taxon Data:", taxonData);
    const iNatImage =
      taxonData.results?.[0]?.taxon_photos?.[0]?.photo?.original_url;
    if (iNatImage) return iNatImage;
  }

  // 2. Wikipedia
  const wikiRes = await fetch(`${WIKI}/${encodeURIComponent(canonicalName)}`);
  const wikiData = await wikiRes.json();
  // console.log("Wikipedia Data:", wikiData);
  if (wikiData && wikiData?.thumbnail?.source) return wikiData.thumbnail.source;

  // 3. GBIF
  const gbifRes = await fetch(
    `https://api.gbif.org/v1/occurrence/search?mediaType=StillImage&taxon_key=${specieKey}&limit=1`,
  );
  const gbifData = await gbifRes.json();
  // console.log("GBIF Data:", gbifData);
  const gbifImage = gbifData.results?.[0]?.media?.[0]?.identifier;
  if (gbifImage) return gbifImage;

  return null;
};
