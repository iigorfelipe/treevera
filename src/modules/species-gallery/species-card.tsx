import { Heart, Loader2, ImageOff } from "lucide-react";
import type { SeenSpecies } from "@/common/types/user";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { useSpecieInfo } from "@/hooks/use-specie-info";

type SpeciesCardProps = {
  species: SeenSpecies;
  onClick: () => void;
  searchQuery?: string;
};

export const SpeciesCard = ({ species, onClick, searchQuery }: SpeciesCardProps) => {
  const {
    specieName,
    familyName,
    isLoading: isLoadingInfo,
  } = useSpecieInfo(species.key);

  const resolvedName =
    !isLoadingInfo && specieName !== "—" ? specieName : undefined;

  const { data: imageData, isLoading: isLoadingImage } = useGetSpecieImage(
    species.key,
    resolvedName,
  );

  const isLoading = isLoadingInfo || isLoadingImage;

  if (!isLoading && searchQuery?.trim()) {
    const query = searchQuery.toLowerCase();
    if (
      !specieName.toLowerCase().includes(query) &&
      !familyName.toLowerCase().includes(query)
    ) {
      return null;
    }
  }

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:shadow-2xl"
    >
      <div className="relative w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        {isLoading ? (
          <div className="flex aspect-4/3 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-slate-400" />
          </div>
        ) : imageData?.imgUrl ? (
          <>
            <img
              src={imageData.imgUrl}
              alt={specieName}
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex aspect-4/3 flex-col items-center justify-center text-slate-400">
            <ImageOff className="mb-2 size-12" />
            <p className="text-xs">Sem imagem</p>
          </div>
        )}

        {species.fav && (
          <div className="absolute top-2 right-2 rounded-full bg-white/95 p-1.5 shadow-lg backdrop-blur-sm">
            <Heart className="size-4 fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900 italic transition-colors group-hover:text-blue-600">
          {specieName}
        </h3>
        <p className="line-clamp-1 text-xs text-slate-600">{familyName}</p>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-colors group-hover:border-blue-500" />
    </div>
  );
};
