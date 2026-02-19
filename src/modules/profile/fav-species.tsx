import { Image } from "@/common/components/image";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { useSpecieInfo } from "@/hooks/use-specie-info";
import { authStore } from "@/store/auth/atoms";
import { useAtomValue } from "jotai";
import { Loader, Plus } from "lucide-react";
import { useMemo } from "react";

const EmptyFavCard = () => (
  <div className="dark:bg-accent flex aspect-3/4 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all duration-300 hover:border-slate-400 dark:border-slate-600">
    <div className="text-center">
      <Plus className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-500" />
      <div className="text-xs text-slate-400 dark:text-slate-500">
        Adicionar favorita
      </div>
    </div>
  </div>
);

const FilledFavCard = ({ specieKey }: { specieKey: number }) => {
  const {
    specieName,
    familyName,
    isLoading: isLoadingInfo,
  } = useSpecieInfo(specieKey);

  const resolvedName =
    !isLoadingInfo && specieName !== "—" ? specieName : undefined;
  const { data: imageData, isLoading: isLoadingImage } = useGetSpecieImage(
    specieKey,
    resolvedName,
  );

  const isLoading = isLoadingInfo || isLoadingImage;

  return (
    <div className="group relative cursor-pointer">
      {isLoading ? (
        <div className="bg-accent flex aspect-3/4 w-full animate-pulse items-center justify-center overflow-hidden rounded-xl">
          <Loader className="size-5 animate-spin" />
        </div>
      ) : imageData?.imgUrl ? (
        <>
          <figure className="relative aspect-3/4 w-full overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 ease-out group-hover:shadow-lg">
            <Image
              src={imageData.imgUrl}
              alt={specieName}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-3 pt-8 pb-3">
              <p className="truncate text-xs leading-tight font-semibold text-white">
                {specieName}
              </p>
              <p className="truncate text-xs text-white/70 italic">
                {familyName}
              </p>
            </div>
          </figure>

          <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="overflow-hidden rounded-xl bg-neutral-900 shadow-2xl ring-1 ring-white/10">
              <img
                src={imageData.imgUrl}
                alt={specieName}
                className="block max-h-56 max-w-56 object-contain"
              />
            </div>
            <div className="mx-auto h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-neutral-900" />
          </div>
        </>
      ) : (
        <EmptyFavCard />
      )}
    </div>
  );
};

export const FavoriteSpecies = () => {
  const userDb = useAtomValue(authStore.userDb);

  const topFavKeys = useMemo(() => {
    const topFav = userDb?.game_info.top_fav_species ?? [];
    const seenSpecies = userDb?.game_info.seen_species ?? [];

    const seenFavKeys = seenSpecies
      .filter((s) => s.fav)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((s) => s.key);

    const topFavKeyList = topFav.map((n) => n.key);
    const existingKeys = new Set(topFavKeyList);

    return [
      ...topFavKeyList,
      ...seenFavKeys.filter((k) => !existingKeys.has(k)),
    ].slice(0, 4);
  }, [userDb]);

  const slots: (number | undefined)[] = [...topFavKeys];
  while (slots.length < 4) slots.push(undefined);

  return (
    <div className="space-y-3">
      <h2 className="border-b">ESPÉCIES FAVORITAS</h2>

      <div className="grid grid-cols-2 gap-3 overflow-visible sm:gap-4 lg:grid-cols-4">
        {slots.map((key, idx) =>
          key !== undefined ? (
            <FilledFavCard key={key} specieKey={key} />
          ) : (
            <EmptyFavCard key={`empty-${idx}`} />
          ),
        )}
      </div>
    </div>
  );
};
