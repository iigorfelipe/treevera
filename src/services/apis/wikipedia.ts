import type { StatusCode } from "@/common/components/vulnerability-badge";

const WIKI = `https://en.wikipedia.org/api/rest_v1/page/summary`;

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

    const code = labelToCode[label] ?? null;

    return code;
  } catch (err) {
    console.error("Erro ao buscar status na Wikidata:", err);
    return null;
  }
}

type Params = { canonicalName: string };

export const getSpecieImageFromWikipedia = async ({
  canonicalName,
}: Params) => {
  const url = `${WIKI}/${encodeURIComponent(canonicalName)}`;

  const wikiRes = await fetch(url).then((res) => res.json());

  if (!wikiRes?.thumbnail?.source) return null;

  return {
    source: "Wikipedia",
    imgUrl: wikiRes.thumbnail.source,
    licenseCode: "",
    author: "",
  };
};
