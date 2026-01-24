import { Image } from "@/common/components/image";
import { cn } from "@/common/utils/cn";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { authStore } from "@/store/auth";
import { useAtomValue } from "jotai";
import { Loader, Plus } from "lucide-react";
import { useMemo } from "react";

export const FavoriteSpecies = () => {
  const userDb = useAtomValue(authStore.userDb);

  const topFavSpecies = useMemo(() => {
    const topFav = userDb?.game_info.top_fav_species ?? [];
    const speciesBook = userDb?.game_info.species_book ?? [];

    if (topFav.length === 4) {
      return topFav;
    }

    const bookFavs = speciesBook
      .filter((s) => s.fav)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const existingKeys = new Set(topFav.map((n) => n.key));

    const missing = bookFavs
      .filter((s) => !existingKeys.has(s.key))
      .slice(0, 4 - topFav.length)
      .map((s) => ({
        key: s.key,
        name: s.specie_name,
        family: s.family_name,
      }));

    return [...topFav, ...missing].slice(0, 4).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [userDb]);

  const [first, second, third, fourth] = topFavSpecies;

  const img1 = useGetSpecieImage(first?.key, first?.name);
  const img2 = useGetSpecieImage(second?.key, second?.name);
  const img3 = useGetSpecieImage(third?.key, third?.name);
  const img4 = useGetSpecieImage(fourth?.key, fourth?.name);

  const speciesWithImages = useMemo(
    () =>
      [
        { ...first, image: img1.data, isLoading: img1.isLoading },
        { ...second, image: img2.data, isLoading: img2.isLoading },
        { ...third, image: img3.data, isLoading: img3.isLoading },
        { ...fourth, image: img4.data, isLoading: img4.isLoading },
      ].filter(Boolean),
    [first, second, third, fourth, img1, img2, img3, img4],
  );

  return (
    <div className="space-y-3">
      <h2 className="border-b">ESPÉCIES FAVORITAS</h2>

      <div className="grid grid-cols-1 gap-4 overflow-visible sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {speciesWithImages.map((species, index) => (
          <div
            key={index}
            className="group relative flex cursor-pointer flex-col items-center gap-2"
          >
            {species && species.image?.imgUrl ? (
              <>
                <figure className="relative h-[277px] w-[194px] overflow-hidden rounded-lg bg-neutral-100 shadow-sm transition-all duration-300 ease-out group-hover:z-20 group-hover:scale-140 group-hover:shadow-xl">
                  {species.isLoading ? (
                    <div className="bg-accent flex size-full animate-pulse items-center justify-center">
                      <Loader className="size-5 animate-spin" />
                    </div>
                  ) : (
                    <Image
                      src={species.image?.imgUrl ?? ""}
                      alt={species.name}
                      loading="lazy"
                      className={cn(
                        "size-full transition-all duration-300 ease-out",
                        "object-cover group-hover:object-contain",
                      )}
                    />
                  )}
                </figure>

                <div className="text-center transition-opacity duration-300 group-hover:opacity-100">
                  <div className="text-xs font-medium">{species.name}</div>
                  <div className="text-xs italic">{species.family}</div>
                </div>
              </>
            ) : (
              <div className="dark:bg-accent flex h-[277px] w-[194px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-400 bg-slate-50 transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <Plus className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <div className="text-xs text-slate-500">
                    Adicionar favorita
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
