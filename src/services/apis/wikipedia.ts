import type { StatusCode } from "@/common/components/vulnerability-badge";

const getWikiBaseUrl = (lang: string) =>
  `https://${lang}.wikipedia.org/api/rest_v1/page/summary`;

export const getWikiSpecieDetail = async (name: string, lang = "pt") => {
  try {
    const res = await fetch(
      `${getWikiBaseUrl(lang)}/${encodeURIComponent(name)}`,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
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
  const url = `${getWikiBaseUrl("pt")}/${encodeURIComponent(canonicalName)}`;

  const wikiRes = await fetch(url).then((res) => res.json());

  if (!wikiRes?.thumbnail?.source) return null;

  return {
    source: "Wikipedia",
    imgUrl: wikiRes.thumbnail.source,
    licenseCode: "",
    author: "",
  };
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function isOpenCommonsLicense(license: string): boolean {
  const l = license.toLowerCase().trim();
  return (
    l.startsWith("cc") ||
    l === "pd" ||
    l === "cc0" ||
    l.includes("public domain")
  );
}

export const getSpecieImagesFromWikimediaCommons = async ({
  canonicalName,
}: Params): Promise<
  Array<{ source: string; imgUrl: string; licenseCode: string; author: string }>
> => {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query` +
    `&generator=search&gsrnamespace=6` +
    `&gsrsearch=${encodeURIComponent(canonicalName)}` +
    `&prop=imageinfo&iiprop=url%7Cextmetadata&iilimit=1` +
    `&format=json&gsrlimit=10&origin=*`;

  const data = await fetch(url).then((res) => res.json());
  const pages = data.query?.pages;
  if (!pages) return [];

  const imageExtensions = /\.(jpe?g|png|gif|webp)$/i;

  return (Object.values(pages) as Record<string, unknown>[])
    .map((page) => {
      const info = (
        page as { imageinfo?: { url: string; extmetadata?: Record<string, { value: string }> }[] }
      ).imageinfo?.[0];
      if (!info) return null;
      if (!imageExtensions.test(info.url)) return null;

      const meta = info.extmetadata ?? {};
      const licenseCode =
        meta.LicenseShortName?.value ?? meta.License?.value ?? "";
      const rawAuthor = meta.Artist?.value ?? meta.Credit?.value ?? "";

      if (!isOpenCommonsLicense(licenseCode)) return null;

      return {
        source: "Wikimedia Commons",
        imgUrl: info.url,
        licenseCode,
        author: stripHtml(rawAuthor),
      };
    })
    .filter(
      (
        img,
      ): img is {
        source: string;
        imgUrl: string;
        licenseCode: string;
        author: string;
      } => img !== null,
    );
};
