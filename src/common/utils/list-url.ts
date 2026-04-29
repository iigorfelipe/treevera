import { slugify } from "./slugify";

export const getListSlugParam = (title: string) => slugify(title);
