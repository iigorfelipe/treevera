const INATURALIST = `https://api.inaturalist.org/v1`;

type Params = { canonicalName: string };

export const getSpecieImageFromINaturalist = async ({
  canonicalName,
}: Params) => {
  const url = `${INATURALIST}/search?q=${encodeURIComponent(canonicalName)}&sources=taxa`;

  const iNatData = await fetch(url).then((res) => res.json());

  if (!iNatData) return null;
  if (!iNatData.results?.[0]?.record?.id) return null;

  const iNatPhoto = iNatData.results[0].record.taxon_photos?.[0]?.photo;

  if (iNatPhoto) {
    return {
      source: "iNaturalist",
      imgUrl: iNatPhoto.original_url,
      licenseCode: iNatPhoto.license_code,
      author: iNatPhoto.attribution_name,
    };
  }
};
