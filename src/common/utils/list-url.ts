import { slugify } from "./slugify";

const LIST_ID_SLUG_PREFIX = "list-";

type ListSlugSource = {
  id?: string | null;
  title: string;
  slug?: string | null;
};

export const getFallbackListSlug = (id: string) =>
  `${LIST_ID_SLUG_PREFIX}${id}`;

export function getListSlugParam(list: ListSlugSource): string;
export function getListSlugParam(
  title: string,
  storedSlug?: string | null,
  id?: string | null,
): string;
export function getListSlugParam(
  input: string | ListSlugSource,
  storedSlug?: string | null,
  id?: string | null,
) {
  const title = typeof input === "string" ? input : input.title;
  const persistedSlug = typeof input === "string" ? storedSlug : input.slug;
  const listId = typeof input === "string" ? id : input.id;
  const titleSlug = slugify(title);

  if (titleSlug) return titleSlug;
  if (listId) return getFallbackListSlug(listId);

  const normalizedPersistedSlug = persistedSlug?.trim();
  if (normalizedPersistedSlug) return normalizedPersistedSlug;

  return "list";
}

export const parseListIdFromSlug = (slug: string | undefined) => {
  const value = slug?.trim();
  if (!value?.startsWith(LIST_ID_SLUG_PREFIX)) return null;

  const id = value.slice(LIST_ID_SLUG_PREFIX.length);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  )
    ? id
    : null;
};
