export function slugifyScientificName(value: string | null | undefined) {
  const slug = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "species";
}

export function getSpeciesPath(
  gbifKey: number | string,
  scientificName?: string | null,
) {
  const slug = getSpeciesSlugParam(gbifKey, scientificName);
  return slug ? `/species/${slug}` : `/specie-detail/${String(gbifKey)}`;
}

export function getSpeciesSlugParam(
  gbifKey: number | string,
  scientificName?: string | null,
) {
  const key = String(gbifKey);
  if (!scientificName) return null;
  return `${slugifyScientificName(scientificName)}-${key}`;
}

export function parseGbifKeyFromSpeciesSlug(slug: string | undefined) {
  const match = slug?.match(/-(\d+)$/);
  if (!match) return null;

  const key = Number(match[1]);
  return Number.isFinite(key) && key > 0 ? key : null;
}
