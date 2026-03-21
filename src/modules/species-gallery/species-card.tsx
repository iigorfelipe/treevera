import { useState } from "react";
import { Heart, ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";
import { clearBrokenImage } from "@/common/utils/supabase/user-seen-species";

type SpeciesCardProps = {
  species: GallerySpeciesRow;
  onClick: () => void;
};

export const SpeciesCard = ({
  species,
  onClick,
}: SpeciesCardProps) => {
  const { t } = useTranslation();
  const [imgBroken, setImgBroken] = useState(false);

  const specieName = species.canonical_name || "—";
  const familyName = species.family || "—";
  const imgUrl = species.image_url;
  const hasImage = !!imgUrl && !imgBroken;

  return (
    <div
      onClick={onClick}
      className="group bg-card relative cursor-pointer overflow-hidden rounded-xl border shadow-md transition-all duration-300 hover:shadow-2xl"
    >
      <div className="bg-muted relative w-full overflow-hidden">
        {hasImage ? (
          <>
            <img
              src={imgUrl}
              alt={specieName}
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => {
                setImgBroken(true);
                void clearBrokenImage(species.gbif_key);
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          <div className="text-muted-foreground flex aspect-4/3 flex-col items-center justify-center">
            <ImageOff className="mb-2 size-12" />
            <p className="text-xs">{t("gallery.noImage")}</p>
          </div>
        )}

        {species.is_favorite && (
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
