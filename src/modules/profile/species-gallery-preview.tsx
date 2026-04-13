import { useRef } from "react";
import { Button } from "@/common/components/ui/button";
import { Image } from "@/common/components/image";
import { Skeleton } from "@/common/components/ui/skeleton";
import { inatImageUrl } from "@/common/utils/image-size";
import { Images, ChevronRight, Leaf } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useTranslation } from "react-i18next";
import { useGetRecentSeenSpecies } from "@/hooks/queries/useGetUserSeenSpecies";
import { SpeciesCardQuickMenu } from "@/modules/species-gallery/species-card-quick-menu";
import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";

const RecentSpeciesCard = ({
  gbifKey,
  imgUrl,
  name,
  family,
  isFavorite,
}: {
  gbifKey: number;
  imgUrl: string | null | undefined;
  name: string | null;
  family: string | null;
  isFavorite: boolean;
}) => {
  const navigate = useNavigate();
  const dialogCloseTimeRef = useRef(0);

  const handleDialogClose = () => {
    dialogCloseTimeRef.current = Date.now();
  };

  const handleCardClick = () => {
    if (Date.now() - dialogCloseTimeRef.current < 300) return;
    navigate({
      to: "/specie-detail/$specieKey",
      params: { specieKey: String(gbifKey) },
      search: { from: "profile" },
    });
  };

  const galleryRow: GallerySpeciesRow = {
    gbif_key: gbifKey,
    canonical_name: name,
    family,
    image_url: imgUrl ?? null,
    is_favorite: isFavorite,
    seen_at: "",
    total_count: 0,
  };

  return (
    <div className="group relative">
      <figure
        onClick={handleCardClick}
        className="relative aspect-3/4 w-full cursor-pointer overflow-hidden rounded-xl shadow-sm group-hover:shadow-lg"
      >
        {imgUrl ? (
          <Image
            src={inatImageUrl(imgUrl, "medium")}
            alt={name ?? ""}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="bg-muted flex size-full items-center justify-center">
            <Leaf className="text-muted-foreground/30 size-10" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-3 pt-8 pb-3">
          <p className="truncate text-xs leading-tight font-semibold text-white">
            {name}
          </p>
          <p className="truncate text-xs text-white/70 italic">{family}</p>
        </div>
      </figure>

      <SpeciesCardQuickMenu
        species={galleryRow}
        onDialogClose={handleDialogClose}
      />

      {imgUrl && (
        <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-popover ring-border overflow-hidden rounded-xl shadow-2xl ring-1">
            <img
              src={inatImageUrl(imgUrl, "medium")}
              alt={name ?? ""}
              className="block max-h-56 max-w-56 object-contain"
            />
          </div>
          <div className="border-t-popover mx-auto h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent" />
        </div>
      )}
    </div>
  );
};

export const SpeciesGalleryPreview = ({
  userId,
  profileUsername,
}: {
  userId?: string;
  profileUsername?: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);
  const { data: seenSpecies = [], isLoading } = useGetRecentSeenSpecies(
    4,
    userId,
  );

  const handleOpenGallery = () => {
    const target = profileUsername ?? userDb?.username;
    if (target) {
      navigate({
        to: "/$username/species-gallery",
        params: { username: target },
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b pb-1">
        <h2>{t("seenSpecies.title")}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-7 px-2 text-xs"
          disabled={!seenSpecies.length}
          onClick={handleOpenGallery}
        >
          {t("seenSpecies.openGallery")}
          <ChevronRight className="ml-1 size-3" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-3/4 rounded-xl" />
          ))}
        </div>
      ) : !seenSpecies.length ? (
        <div className="text-muted-foreground py-8 text-center">
          <Images className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">
            {profileUsername
              ? t("seenSpecies.emptyTitleOf", { username: profileUsername })
              : t("seenSpecies.emptyTitle")}
          </div>
          {!profileUsername && (
            <div className="text-xs">{t("seenSpecies.emptyHint")}</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {seenSpecies.map((species) => (
            <RecentSpeciesCard
              key={species.gbif_key}
              gbifKey={species.gbif_key}
              imgUrl={species.preferred_image_url}
              name={species.canonical_name}
              family={species.family}
              isFavorite={species.is_favorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
