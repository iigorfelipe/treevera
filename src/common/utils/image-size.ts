export type InatSize = "square" | "small" | "medium" | "large" | "original";

const INAT_SIZE_RE =
  /\/(square|small|medium|large|original)\.(jpe?g|png|gif|webp)/i;

export function inatImageUrl(url: string, size: InatSize): string {
  return url.replace(INAT_SIZE_RE, `/${size}.$2`);
}

export function inferImageSource(url: string): string | null {
  if (url.includes("inaturalist")) return "iNaturalist";
  if (url.includes("wikimedia.org")) return "Wikimedia Commons";
  if (url.includes("gbif.org")) return "GBIF";
  return null;
}

export function buildAttributionText(
  source: string | null | undefined,
  author: string | null | undefined,
  license: string | null | undefined,
  imgUrl?: string | null,
): string | null {
  const resolvedSource = source ?? (imgUrl ? inferImageSource(imgUrl) : null);
  if (!resolvedSource) return null;
  const parts: string[] = [resolvedSource];
  const cleanAuthor = author?.trim();
  if (cleanAuthor && !cleanAuthor.startsWith("http")) {
    parts.push(`@${cleanAuthor}`);
  }
  if (license?.trim()) parts.push(license.trim());
  return parts.join(" · ");
}
