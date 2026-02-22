import type { FavSpecies } from "@/common/types/user";

/** Turns the current display keys into a FavSpecies[] for DB writes,
 *  preserving cached data for keys already stored in top_fav_species. */
export const materializeSlots = (
  displayKeys: number[],
  existingTopFav: FavSpecies[],
): FavSpecies[] => {
  const existingMap = new Map(existingTopFav.map((f) => [f.key, f]));
  return displayKeys.map(
    (key) => existingMap.get(key) ?? { key, name: "", img: "", family: "" },
  );
};
