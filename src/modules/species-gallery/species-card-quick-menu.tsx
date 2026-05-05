import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MoreVertical,
  ListPlus,
  Heart,
  Copy,
  Share2,
  ListTree,
  Images,
  ImagePlus,
  ImageMinus,
  Loader2,
  Target,
  Wallpaper,
} from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { ConfirmDialog } from "@/common/components/ui/confirm-dialog";
import { authStore } from "@/store/auth/atoms";
import { injectPathNodesAtom } from "@/store/tree";
import { useGetParents } from "@/hooks/queries/useGetParents";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import type { NodeEntity, PathNode } from "@/common/types/tree-atoms";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useGetSpecieGallery } from "@/hooks/queries/useGetSpecieGallery";
import { useGetSeenSpecieByKey } from "@/hooks/queries/useGetUserSeenSpecies";
import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";
import {
  addSpeciesToGallery,
  removeSpeciesFromGallery,
  toggleFavSpecie,
  updatePreferredImage,
} from "@/common/utils/supabase/user-seen-species";
import {
  setListCoverImage,
  updateListSpeciesImage,
} from "@/common/utils/supabase/lists";
import { AddToListDialog } from "@/modules/lists/add-to-list-dialog";
import { CreateCustomChallengeDialog } from "@/modules/challenge/custom/create-custom-challenge-dialog";
import { cn } from "@/common/utils/cn";
import { getAppUrl } from "@/common/utils/base-url";
import { useCheckAchievements } from "@/hooks/mutations/useCheckAchievements";
import { getSpeciesPath } from "@/common/utils/species-url";

type SpeciesCardQuickMenuProps = {
  species: GallerySpeciesRow;
  listId?: string;
  listUsername?: string;
  listSlug?: string;
  ownerUsername?: string;
  onDialogClose?: () => void;
  triggerClassName?: string;
  hideImageActions?: boolean;
  showPinnedActions?: boolean;
};

export const SpeciesCardQuickMenu = ({
  species,
  listId,
  listUsername,
  listSlug,
  ownerUsername,
  onDialogClose,
  triggerClassName,
  hideImageActions = false,
  showPinnedActions = false,
}: SpeciesCardQuickMenuProps) => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);
  const setUserDb = useSetAtom(authStore.userDb);
  const canUseAuthenticatedActions = isAuthenticated && !!userDb;
  const queryClient = useQueryClient();
  const checkAchievements = useCheckAchievements();

  const [addToListOpen, setAddToListOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [createChallengeOpen, setCreateChallengeOpen] = useState(false);
  const [removeGalleryConfirmOpen, setRemoveGalleryConfirmOpen] =
    useState(false);
  const [isFav, setIsFav] = useState(species.is_favorite);
  const [isInGallery, setIsInGallery] = useState(
    species.is_in_gallery ?? false,
  );
  const [currentImageUrl, setCurrentImageUrl] = useState(species.image_url);
  const [favPending, setFavPending] = useState(false);
  const [galleryPending, setGalleryPending] = useState(false);
  const [viewInTreePending, setViewInTreePending] = useState(false);

  const shouldFetchGalleryState =
    canUseAuthenticatedActions && species.is_in_gallery === undefined;
  const { data: currentUserGallerySpecies, isLoading: galleryStateLoading } =
    useGetSeenSpecieByKey(
      shouldFetchGalleryState ? species.gbif_key : undefined,
    );

  const { data: gallery = [], isLoading: galleryLoading } = useGetSpecieGallery(
    imagePickerOpen ? species.gbif_key : undefined,
    imagePickerOpen && species.canonical_name
      ? species.canonical_name
      : undefined,
  );

  const { data: parents = [] } = useGetParents(
    species.gbif_key,
    viewInTreePending,
  );
  const injectPathNodes = useSetAtom(injectPathNodesAtom);
  const { navigateToNodes } = useTreeNavigation();

  useEffect(() => {
    if (!viewInTreePending || parents.length === 0) return;

    const kingdom =
      parents.find((p) => p.rank?.toUpperCase() === "KINGDOM")?.canonicalName ??
      "";

    const pathNodes: PathNode[] = [
      ...parents.map((p) => ({
        key: p.key,
        rank: p.rank,
        name: p.canonicalName || p.scientificName || "",
      })),
      {
        key: species.gbif_key,
        rank: "SPECIES" as const,
        name: species.canonical_name ?? "",
      },
    ];

    const entities: NodeEntity[] = pathNodes.map((pn, i) => {
      const parent = parents.find((p) => p.key === pn.key);
      return {
        key: pn.key,
        rank: pn.rank,
        numDescendants:
          parent?.numDescendants ?? (pn.rank === "SPECIES" ? 0 : 1),
        canonicalName: pn.name || undefined,
        kingdom,
        parentKey: i > 0 ? pathNodes[i - 1].key : undefined,
      };
    });

    injectPathNodes(entities);
    navigateToNodes(pathNodes, true);
    setViewInTreePending(false);
  }, [viewInTreePending, parents, species, injectPathNodes, navigateToNodes]);

  useEffect(() => {
    setIsFav(species.is_favorite);
  }, [species.is_favorite]);

  useEffect(() => {
    setIsInGallery(species.is_in_gallery ?? Boolean(currentUserGallerySpecies));
  }, [species.is_in_gallery, currentUserGallerySpecies]);

  useEffect(() => {
    setCurrentImageUrl(species.image_url);
  }, [species.image_url]);

  const isOwner = listId
    ? listUsername === userDb?.username
    : ownerUsername !== undefined
      ? ownerUsername === userDb?.username
      : true;

  const invalidateSpeciesMembership = () => {
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_seen_species_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.seen_specie_by_key_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.favorite_species_page_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.specie_gallery_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.list_species_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_seen_in_list_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.achievement_progress_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.public_profile_key],
    });
  };

  const handleFavToggle = async () => {
    if (favPending || !isInGallery) return;
    const newFav = !isFav;
    setIsFav(newFav);
    setFavPending(true);
    try {
      await toggleFavSpecie(
        userDb!.id,
        species.gbif_key,
        newFav,
        currentImageUrl,
        {
          canonicalName: species.canonical_name,
          family: species.family,
        },
      );
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_seen_species_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.seen_specie_by_key_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.favorite_species_page_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.species_fav_count_key, species.gbif_key],
      });
    } finally {
      setFavPending(false);
    }
  };

  const handleGalleryToggle = async () => {
    if (!userDb || galleryPending || galleryStateLoading) return;

    const previousInGallery = isInGallery;
    const previousFav = isFav;
    const nextInGallery = !previousInGallery;

    setIsInGallery(nextInGallery);
    if (!nextInGallery) setIsFav(false);
    setGalleryPending(true);

    try {
      if (nextInGallery) {
        await addSpeciesToGallery({
          gbifKey: species.gbif_key,
          kingdom: species.kingdom,
          iucnStatus: species.iucn_status,
          canonicalName: species.canonical_name,
          family: species.family,
          imageUrl: currentImageUrl,
          imageSource: species.image_source,
          imageAttribution: species.image_attribution,
          imageLicense: species.image_license,
        });
        toast.success(t("gallery.addedToGallery"));
        void checkAchievements();
      } else {
        await removeSpeciesFromGallery(species.gbif_key);
        setUserDb((prev) =>
          prev
            ? {
                ...prev,
                game_info: {
                  ...prev.game_info,
                  top_fav_species: prev.game_info.top_fav_species?.filter(
                    (item) => item.key !== species.gbif_key,
                  ),
                },
              }
            : prev,
        );
        toast.success(t("gallery.removedFromGallery"));
        if (previousFav) {
          void queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.species_fav_count_key, species.gbif_key],
          });
        }
      }

      invalidateSpeciesMembership();
    } catch {
      setIsInGallery(previousInGallery);
      setIsFav(previousFav);
      toast.error(t("gallery.galleryUpdateError"));
    } finally {
      setGalleryPending(false);
    }
  };

  const handleShare = async () => {
    const url = getAppUrl(
      getSpeciesPath(species.gbif_key, species.canonical_name),
    );
    const name = species.canonical_name ?? "";
    if (navigator.share) {
      await navigator
        .share({
          title: name,
          url,
          text: t("specieDetail.shareText", { name }),
        })
        .catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast(t("specieDetail.shareCopied"));
    }
  };

  const handleCopyScientificName = async () => {
    const name = species.canonical_name?.trim();
    if (!name) return;

    try {
      await navigator.clipboard.writeText(name);
      toast(t("gallery.scientificNameCopied"));
    } catch {
      toast.error(t("gallery.copyScientificNameError"));
    }
  };

  const handleViewInTree = () => {
    setViewInTreePending(true);
  };

  const handlePickImage = async (img: {
    imgUrl: string;
    source: string;
    author: string;
    licenseCode: string;
  }) => {
    if (listId && isOwner) {
      await updateListSpeciesImage(listId, species.gbif_key, img.imgUrl, {
        source: img.source,
        author: img.author,
        license: img.licenseCode,
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.list_species_key],
      });
    } else {
      await updatePreferredImage(userDb!.id, species.gbif_key, img.imgUrl, {
        canonicalName: species.canonical_name,
        family: species.family,
        source: img.source,
        author: img.author,
        license: img.licenseCode,
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_seen_species_key],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.seen_specie_by_key_key],
      });
    }
    setCurrentImageUrl(img.imgUrl);
    setImagePickerOpen(false);
    toast.success(t("gallery.imageUpdated"));
  };

  const handleSetListCover = async () => {
    if (!listId || !currentImageUrl) return;
    await setListCoverImage(listId, currentImageUrl);
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.list_detail_key, listUsername, listSlug],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_lists_key],
    });
    toast.success(t("lists.listCoverUpdated"));
  };

  const canEditImage = listId ? isOwner : isOwner && isInGallery;
  const currentImageForPicker = currentImageUrl
    ? {
        imgUrl: currentImageUrl,
        source: species.image_source ?? "",
        author: species.image_attribution ?? "",
        licenseCode: species.image_license ?? "",
      }
    : null;
  const currentImageAlreadyInPicker =
    !!currentImageForPicker &&
    gallery.some((img) => img.imgUrl === currentImageForPicker.imgUrl);
  const pickerGallery =
    gallery.length > 0
      ? currentImageForPicker && !currentImageAlreadyInPicker
        ? [...gallery, currentImageForPicker]
        : gallery
      : currentImageForPicker
        ? [currentImageForPicker]
        : [];
  const pinnedActionClass =
    "group/action z-10 cursor-pointer rounded-full bg-black/40 p-2 text-white shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-black/60 active:bg-black/70 disabled:cursor-wait disabled:opacity-70";
  const pinnedIconClass =
    "size-3.5 transition-transform duration-200 group-hover/action:-rotate-12 group-hover/action:scale-125 group-active/action:scale-90";
  const menuItemClass = "group/item";
  const menuIconClass =
    "mr-2 size-4 transition-transform duration-200 group-hover/item:-rotate-12 group-hover/item:scale-125 group-focus/item:-rotate-12 group-focus/item:scale-125";

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "z-10 cursor-pointer rounded-full shadow backdrop-blur-sm",
            triggerClassName ??
              "bg-card/80 absolute right-2 bottom-13 p-1.5 transition-opacity md:opacity-0 md:group-hover:opacity-100",
          )}
          aria-label={t("gallery.quickActions")}
        >
          <MoreVertical className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {canUseAuthenticatedActions && (
            <DropdownMenuItem
              onClick={() => setAddToListOpen(true)}
              className={menuItemClass}
            >
              <ListPlus className={menuIconClass} />
              {t("lists.addToList")}
            </DropdownMenuItem>
          )}

          {canUseAuthenticatedActions && (
            <DropdownMenuItem
              onClick={() =>
                isInGallery
                  ? setRemoveGalleryConfirmOpen(true)
                  : void handleGalleryToggle()
              }
              disabled={galleryPending || galleryStateLoading}
              className={menuItemClass}
            >
              {galleryPending || galleryStateLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : isInGallery ? (
                <ImageMinus className={menuIconClass} />
              ) : (
                <ImagePlus className={menuIconClass} />
              )}
              {isInGallery
                ? t("gallery.removeFromGallery")
                : t("gallery.addToGallery")}
            </DropdownMenuItem>
          )}

          {canUseAuthenticatedActions && isOwner && isInGallery && (
            <DropdownMenuItem
              onClick={handleFavToggle}
              disabled={favPending}
              className={menuItemClass}
            >
              <Heart
                className={cn(
                  menuIconClass,
                  isFav ? "fill-red-500 text-red-500" : "",
                )}
              />
              {isFav ? t("gallery.unfavorite") : t("gallery.favorite")}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleShare} className={menuItemClass}>
            <Share2 className={menuIconClass} />
            {t("specieDetail.shareLabel")}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => void handleCopyScientificName()}
            disabled={!species.canonical_name?.trim()}
            className={menuItemClass}
          >
            <Copy className={menuIconClass} />
            {t("gallery.copyScientificName")}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewInTree} className={menuItemClass}>
            <ListTree className={menuIconClass} />
            {t("gallery.viewInTree")}
          </DropdownMenuItem>

          {canUseAuthenticatedActions && (
            <DropdownMenuItem
              onClick={() => setCreateChallengeOpen(true)}
              className={menuItemClass}
            >
              <Target className={menuIconClass} />
              {t("challenge.createCustom")}
            </DropdownMenuItem>
          )}

          {canUseAuthenticatedActions && canEditImage && !hideImageActions && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setImagePickerOpen(true)}
                className={menuItemClass}
              >
                <Images className={menuIconClass} />
                {t("gallery.chooseImage")}
              </DropdownMenuItem>

              {listId && currentImageUrl && (
                <DropdownMenuItem
                  onClick={handleSetListCover}
                  className={menuItemClass}
                >
                  <Wallpaper className={menuIconClass} />
                  {t("lists.setAsCover")}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {showPinnedActions ? (
        <div className="flex items-center gap-2">
          {canUseAuthenticatedActions && (
            <Tooltip delayDuration={120}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInGallery) {
                      setRemoveGalleryConfirmOpen(true);
                      return;
                    }
                    void handleGalleryToggle();
                  }}
                  disabled={galleryPending || galleryStateLoading}
                  className={pinnedActionClass}
                  aria-label={
                    isInGallery
                      ? t("gallery.removeFromGallery")
                      : t("gallery.addToGallery")
                  }
                >
                  {galleryPending || galleryStateLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : isInGallery ? (
                    <ImageMinus className={pinnedIconClass} />
                  ) : (
                    <ImagePlus className={pinnedIconClass} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isInGallery
                  ? t("gallery.removeFromGallery")
                  : t("gallery.addToGallery")}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip delayDuration={120}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleShare();
                }}
                className={pinnedActionClass}
                aria-label={t("specieDetail.shareLabel")}
              >
                <Share2 className={pinnedIconClass} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("specieDetail.shareLabel")}
            </TooltipContent>
          </Tooltip>

          {menu}
        </div>
      ) : (
        menu
      )}

      <AddToListDialog
        open={addToListOpen}
        onOpenChange={(open) => {
          setAddToListOpen(open);
          if (!open) onDialogClose?.();
        }}
        gbifKey={species.gbif_key}
        speciesName={species.canonical_name ?? undefined}
        image={
          currentImageUrl
            ? {
                url: currentImageUrl,
                source: species.image_source,
                author: species.image_attribution,
                license: species.image_license,
              }
            : undefined
        }
      />

      <CreateCustomChallengeDialog
        open={createChallengeOpen}
        onOpenChange={(open) => {
          setCreateChallengeOpen(open);
          if (!open) onDialogClose?.();
        }}
        gbifKey={species.gbif_key}
      />

      <ConfirmDialog
        open={removeGalleryConfirmOpen}
        onOpenChange={(open) => {
          setRemoveGalleryConfirmOpen(open);
          if (!open) onDialogClose?.();
        }}
        title={t("lists.removeSpecies")}
        description={t("gallery.removeSpeciesConfirm")}
        confirmLabel={t("gallery.removeFromGallery")}
        onConfirm={() => void handleGalleryToggle()}
        variant="destructive"
      />

      <Dialog
        open={imagePickerOpen}
        onOpenChange={(open) => {
          setImagePickerOpen(open);
          if (!open) onDialogClose?.();
        }}
      >
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[85dvh] w-[min(92vw,42rem)] max-w-2xl flex-col"
        >
          <DialogHeader className="pb-3">
            <DialogTitle>{t("gallery.chooseImage")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {galleryLoading && pickerGallery.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
              </div>
            ) : pickerGallery.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                {t("gallery.noImages")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pickerGallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => void handlePickImage(img)}
                    className={cn(
                      "hover:border-primary overflow-hidden rounded-lg border-2 transition-all",
                      currentImageUrl === img.imgUrl
                        ? "border-primary"
                        : "border-transparent",
                    )}
                  >
                    <img
                      src={img.imgUrl}
                      alt={img.author || String(i + 1)}
                      className="aspect-4/3 w-full object-cover"
                    />
                    {img.source && (
                      <p className="text-muted-foreground truncate px-2 py-1 text-left text-xs">
                        {img.source}
                        {img.author ? ` · @${img.author.trim()}` : ""}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
