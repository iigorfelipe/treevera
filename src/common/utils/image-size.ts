export type InatSize = "square" | "small" | "medium" | "large" | "original";

const INAT_SIZE_RE =
  /\/(square|small|medium|large|original)\.(jpe?g|png|gif|webp)/i;

export function inatImageUrl(url: string, size: InatSize): string {
  return url.replace(INAT_SIZE_RE, `/${size}.$2`);
}
