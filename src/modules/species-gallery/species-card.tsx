import { useCallback, useRef, useState } from "react";
import { Heart, ImageOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";

import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";
import { updatePreferredImage } from "@/common/utils/supabase/user-seen-species";
import { updateListSpeciesImage } from "@/common/utils/supabase/lists";
import { inatImageUrl, buildAttributionText } from "@/common/utils/image-size";
import { authStore } from "@/store/auth/atoms";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { SpeciesCardQuickMenu } from "./species-card-quick-menu";
import { useRecoverableSpeciesImage } from "./use-recoverable-species-image";

type SpeciesCardProps = {
  species: GallerySpeciesRow;
  onClick: () => void;
  listId?: string;
  listUsername?: string;
  listSlug?: string;
  ownerUsername?: string;
  reserveTopRightActionSpace?: boolean;
};

export const SpeciesCard = ({
  species,
  onClick,
  listId,
  listUsername,
  listSlug,
  ownerUsername,
  reserveTopRightActionSpace = false,
}: SpeciesCardProps) => {
  const { t } = useTranslation();
  const [brokenImgUrl, setBrokenImgUrl] = useState<string | null>(null);
  const [loadedImgUrl, setLoadedImgUrl] = useState<string | null>(null);
  const dialogCloseTimeRef = useRef(0);
  const persistedImageRef = useRef<string | null>(null);
  const userDb = useAtomValue(authStore.userDb);
  const queryClient = useQueryClient();

  const handleDialogClose = () => {
    dialogCloseTimeRef.current = Date.now();
  };

  const handleCardClick = () => {
    if (Date.now() - dialogCloseTimeRef.current < 300) return;
    onClick();
  };

  const specieName = species.canonical_name || "-";
  const familyName = species.family || "-";
  const { image, isRecovered, isResolving, handleImageError } =
    useRecoverableSpeciesImage({
      gbifKey: species.gbif_key,
      canonicalName: species.canonical_name,
      imageUrl: species.image_url,
      imageSource: species.image_source,
      imageAttribution: species.image_attribution,
      imageLicense: species.image_license,
    });

  const imgUrl = image ? inatImageUrl(image.imgUrl, "medium") : null;
  const hasImage = !!imgUrl && brokenImgUrl !== imgUrl;
  const imgLoading = hasImage && loadedImgUrl !== imgUrl;

  const persistRecoveredImage = useCallback(async () => {
    if (!image || !isRecovered || persistedImageRef.current === image.imgUrl) {
      return;
    }

    persistedImageRef.current = image.imgUrl;
    const isListOwner = !!listId && listUsername === userDb?.username;
    const isOwnGallery =
      !listId &&
      !!userDb &&
      (!ownerUsername || ownerUsername === userDb.username) &&
      species.is_in_gallery !== false;

    if (isListOwner) {
      await updateListSpeciesImage(listId, species.gbif_key, image.imgUrl, {
        source: image.source,
        author: image.author,
        license: image.licenseCode,
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_species_key],
      });
      return;
    }

    if (isOwnGallery) {
      await updatePreferredImage(userDb.id, species.gbif_key, image.imgUrl, {
        canonicalName: species.canonical_name,
        family: species.family,
        source: image.source,
        author: image.author,
        license: image.licenseCode,
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_seen_species_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.seen_specie_by_key_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.favorite_species_page_key],
      });
    }
  }, [
    image,
    isRecovered,
    listId,
    listUsername,
    ownerUsername,
    queryClient,
    species,
    userDb,
  ]);

  const displaySpecies: GallerySpeciesRow = image
    ? {
        ...species,
        image_url: image.imgUrl,
        image_source: image.source,
        image_attribution: image.author,
        image_license: image.licenseCode,
      }
    : species;

  const attribution = buildAttributionText(
    image?.source,
    image?.author,
    image?.licenseCode,
    image?.imgUrl,
  );

  return (
    <div
      onClick={handleCardClick}
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
              onLoad={() => {
                setLoadedImgUrl(imgUrl);
                void persistRecoveredImage();
              }}
              onError={() => {
                setBrokenImgUrl(imgUrl);
                handleImageError();
              }}
            />
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {attribution && (
              <p className="absolute right-2 bottom-2 rounded bg-black/55 px-1.5 py-0.5 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                {attribution}
              </p>
            )}
          </>
        ) : (
          <div className="text-muted-foreground flex aspect-4/3 flex-col items-center justify-center">
            {isResolving ? (
              <Loader2 className="mb-2 size-8 animate-spin" />
            ) : (
              <ImageOff className="mb-2 size-12" />
            )}
            <p className="text-xs">{t("gallery.noImage")}</p>
          </div>
        )}

        {species.is_favorite && (
          <div
            className={`absolute top-2 ${reserveTopRightActionSpace ? "right-11" : "right-2"} z-10 flex size-6 items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur-sm`}
          >
            <Heart className="size-3.5 fill-red-500 text-red-500" />
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

      <SpeciesCardQuickMenu
        species={displaySpecies}
        listId={listId}
        listUsername={listUsername}
        listSlug={listSlug}
        ownerUsername={ownerUsername}
        onDialogClose={handleDialogClose}
      />

      <div className="border-primary/40 pointer-events-none absolute inset-0 rounded-xl border border-transparent transition-colors group-hover:border-primary/40" />
    </div>
  );
};
