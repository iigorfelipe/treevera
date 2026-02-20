import { Heart, Loader2, ImageOff } from "lucide-react";
import type { SeenSpecies } from "@/common/types/user";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { useSpecieInfo } from "@/hooks/use-specie-info";
import { useTranslation } from "react-i18next";

type SpeciesCardProps = {
  species: SeenSpecies;
  onClick: () => void;
  searchQuery?: string;
};

export const SpeciesCard = ({
  species,
  onClick,
  searchQuery,
}: SpeciesCardProps) => {
  const { t } = useTranslation();
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
      className="group bg-card relative cursor-pointer overflow-hidden rounded-xl border shadow-md transition-all duration-300 hover:shadow-2xl"
    >
      <div className="bg-muted relative w-full overflow-hidden">
        {isLoading ? (
          <div className="flex aspect-4/3 items-center justify-center">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
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
          <div className="text-muted-foreground flex aspect-4/3 flex-col items-center justify-center">
            <ImageOff className="mb-2 size-12" />
            <p className="text-xs">{t("gallery.noImage")}</p>
          </div>
        )}

        {species.fav && (
          <div className="bg-card/95 absolute top-2 right-2 rounded-full p-1.5 shadow-lg backdrop-blur-sm">
            <Heart className="size-4 fill-red-500 text-red-500" />
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-foreground group-hover:text-primary mb-1 line-clamp-2 text-sm font-semibold italic transition-colors">
          {specieName}
        </h3>
        <p className="text-muted-foreground line-clamp-1 text-xs">
          {familyName}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-colors group-hover:border-blue-500" />
    </div>
  );
};
