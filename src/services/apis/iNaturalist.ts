const INATURALIST = `https://api.inaturalist.org/v1`;

type TaxonResult = {
  record?: {
    name?: string;
    matched_term?: string;
    id?: number;
    taxon_photos?: {
      photo?: {
        original_url?: string;
        license_code?: string;
        attribution_name?: string;
      };
    }[];
  };
};

function findTaxonMatch(
  results: TaxonResult[],
  canonicalName: string,
): TaxonResult | undefined {
  const target = canonicalName.toLowerCase();

  const byName = results.find((r) => r.record?.name?.toLowerCase() === target);
  if (byName) return byName;

  const byMatchedTerm = results.find(
    (r) => r.record?.matched_term?.toLowerCase() === target,
  );
  if (byMatchedTerm) return byMatchedTerm;

  return undefined;
}

type Params = { canonicalName: string };

export type INatImageData = {
  source: string;
  imgUrl: string;
  licenseCode: string;
  author: string;
};

export const getSpecieImageFromINaturalist = async ({
  canonicalName,
}: Params): Promise<INatImageData | null | undefined> => {
  const url = `${INATURALIST}/search?q=${encodeURIComponent(canonicalName)}&sources=taxa`;

  const iNatData = await fetch(url).then((res) => res.json());

  if (!iNatData?.results?.[0]?.record?.id) return null;

  const match = findTaxonMatch(iNatData.results, canonicalName);

  if (!match) return null;

  const iNatPhoto = match.record?.taxon_photos?.[0]?.photo;

  if (iNatPhoto?.original_url) {
    return {
      source: "iNaturalist",
      imgUrl: iNatPhoto.original_url,
      licenseCode: iNatPhoto.license_code ?? "",
      author: iNatPhoto.attribution_name ?? "",
    };
  }
};

export const getSpecieImagesFromINaturalist = async ({
  canonicalName,
}: Params): Promise<INatImageData[]> => {
  const url = `${INATURALIST}/search?q=${encodeURIComponent(canonicalName)}&sources=taxa`;

  const iNatData = await fetch(url).then((res) => res.json());

  if (!iNatData?.results?.[0]?.record?.id) return [];

  const match = findTaxonMatch(iNatData.results, canonicalName);

  if (!match) return [];

  const taxonPhotos = match.record?.taxon_photos ?? [];

  return taxonPhotos
    .filter((tp) => !!tp.photo?.original_url)
    .slice(0, 5)
    .map((tp) => ({
      source: "iNaturalist",
      imgUrl: tp.photo!.original_url!,
      licenseCode: tp.photo?.license_code ?? "",
      author: tp.photo?.attribution_name ?? "",
    }));
};
