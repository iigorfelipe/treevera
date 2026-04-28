import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetSpeciesCache } from "@/hooks/queries/useGetSpeciesCache";
import { useGetSpecieGallery } from "@/hooks/queries/useGetSpecieGallery";
import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";
import { SpecieImageDetail } from "@/modules/specie-detail/image";
import { SpecieInfos } from "@/modules/specie-detail/infos";
import { TaxonomyCard } from "@/modules/specie-detail/taxonomy-card";
import { SpeciesCardQuickMenu } from "@/modules/species-gallery/species-card-quick-menu";
import { ListsWithSpecies } from "@/modules/lists/lists-with-species";
import { VulnerabilityBadge } from "@/common/components/vulnerability-badge";
import {
  SkeletonTaxonomy,
  SkeletonText,
} from "@/modules/specie-detail/skeletons";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { useAtomValue, useSetAtom } from "jotai";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import type { UserSeenSpeciesRow } from "@/common/utils/supabase/user-seen-species";
import { useResponsive } from "@/hooks/use-responsive";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Skeleton } from "@/common/components/ui/skeleton";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  toggleFavSpecie,
  updateSeenSpeciesIucn,
} from "@/common/utils/supabase/user-seen-species";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { updateFavActivity } from "@/common/utils/supabase/update-fav-activity";
import { useCheckAchievements } from "@/hooks/mutations/useCheckAchievements";
import {
  useGetSeenSpecieByKey,
  useGetSpeciesFavCount,
  useInvalidateSpeciesFavCount,
} from "@/hooks/queries/useGetUserSeenSpecies";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { authStore } from "@/store/auth/atoms";

const OccurrenceMap = lazy(() =>
  import("@/modules/specie-detail/occurrences-map").then((module) => ({
    default: module.OccurrenceMap,
  })),
);

const OccurrenceMapFallback = () => (
  <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
    <div className="space-y-3 px-4 pt-4 pb-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-full rounded-lg" />
      <Skeleton className="h-70 w-full rounded-xl" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-full" />
      </div>
    </div>
  </div>
);

export const SpecieDetail = ({
  embedded = false,
  showBackHeader = true,
  backLabel,
  onBack,
}: {
  embedded?: boolean;
  showBackHeader?: boolean;
  backLabel?: string;
  onBack?: () => void;
}) => {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const navigate = useNavigate();
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const setSelectedKey = useSetAtom(selectedSpecieKeyAtom);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);

  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;
  const userDb = useAtomValue(authStore.userDb);

  const [pendingUnfav, setPendingUnfav] = useState(false);

  const treeSpecieKey = expandedNodes.find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const specieKey = selectedKey ?? treeSpecieKey;
  const isFromGallery = selectedKey !== null;
  const isFromTree =
    !isFromGallery &&
    treeSpecieKey !== null &&
    treeSpecieKey !== undefined &&
    isTablet;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  const canonicalName =
    specieDetail?.canonicalName || specieDetail?.scientificName;

  useDocumentTitle(canonicalName);

  const { data: gallery = [] } = useGetSpecieGallery(specieKey, canonicalName);

  const { data: cache, isLoading: isLoadingCache } = useGetSpeciesCache(
    specieKey,
    canonicalName,
    undefined,
    specieDetail?.family,
  );
  const primaryImage = cache?.image ?? gallery[0] ?? null;

  const { data: specie } = useGetSeenSpecieByKey(specieKey);
  const { data: favCount = 0 } = useGetSpeciesFavCount(specieKey);
  const invalidateSpeciesFavCount = useInvalidateSpeciesFavCount();
  const queryClient = useQueryClient();
  const checkAchievements = useCheckAchievements();

  const isFav = specie?.is_favorite ?? false;
  const isInGallery = !!specie;

  useEffect(() => {
    if (!userId || !specieKey || !cache?.iucnCode || !specie) return;
    if (specie.iucn_status === cache.iucnCode) return;
    void updateSeenSpeciesIucn(userId, specieKey, cache.iucnCode).then(
      () => void checkAchievements(),
    );
  }, [userId, specieKey, cache?.iucnCode, specie, checkAchievements]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    if (isFromGallery) {
      setSelectedKey(null);
    } else {
      const pathNodes = expandedNodes.filter((n) => n.rank !== "SPECIES");
      const path =
        pathNodes.length > 0
          ? `/tree/${pathNodes.map((n) => n.key).join("/")}`
          : "/";
      setExpandedNodes(pathNodes);
      void navigate({ to: path });
    }
  }, [
    onBack,
    isFromGallery,
    setSelectedKey,
    expandedNodes,
    navigate,
    setExpandedNodes,
  ]);

  const isInTop4 =
    userDb?.game_info.top_fav_species?.some((n) => n.key === specieKey) ??
    false;

  const doToggleFav = async () => {
    if (!userId || specieKey == null || !specie) return;

    const newIsFav = !isFav;

    queryClient.setQueryData(
      [QUERY_KEYS.seen_specie_by_key_key, userId, specieKey],
      (old: UserSeenSpeciesRow | null | undefined) =>
        old ? { ...old, is_favorite: newIsFav } : old,
    );

    await toggleFavSpecie(userId, specieKey, newIsFav, undefined, {
      canonicalName,
      family: specieDetail?.family,
      kingdom: specieDetail?.kingdom,
    });

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.seen_specie_by_key_key, userId, specieKey],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_seen_species_key],
    });
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.favorite_species_page_key],
    });
    if (specieKey != null) invalidateSpeciesFavCount(specieKey);
    void checkAchievements();

    if (newIsFav) {
      void updateFavActivity({
        userId,
        speciesName: canonicalName ?? "",
        isFav: newIsFav,
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.user_activities_key, userId],
      });
    }
  };

  const toggleFav = () => {
    if (isFav && isInTop4) {
      setPendingUnfav(true);
      return;
    }
    void doToggleFav();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonText />
        <SkeletonTaxonomy />
      </div>
    );
  }

  if (!specieDetail) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("specieDetail.notFound")}</p>
      </div>
    );
  }

  const showContextualHeader =
    showBackHeader && (isFromGallery || isFromTree) && !embedded;
  const detailQuickMenuSpecies: GallerySpeciesRow | null =
    specieKey == null
      ? null
      : {
          gbif_key: specieKey,
          canonical_name:
            specieDetail.canonicalName ?? specieDetail.scientificName ?? null,
          family: specieDetail.family ?? null,
          kingdom: specieDetail.kingdom ?? null,
          iucn_status: cache?.iucnCode ?? null,
          image_url: primaryImage?.imgUrl ?? null,
          image_source: primaryImage?.source ?? null,
          image_attribution: primaryImage?.author ?? null,
          image_license: primaryImage?.licenseCode ?? null,
          is_favorite: isFav,
          is_in_gallery: isInGallery,
          seen_at: specie?.seen_at ?? "",
          total_count: 0,
        };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={
          embedded
            ? "@container/specie-detail"
            : "@container/specie-detail h-full"
        }
        style={{ containerType: "inline-size" }}
      >
        {showContextualHeader && (
          <div className="bg-card/95 sticky top-0 z-10 border-b px-4 py-3 shadow-sm backdrop-blur-sm">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              {backLabel ??
                (isFromTree
                  ? t("specieDetail.backToTree")
                  : t("specieDetail.backToGallery"))}
            </Button>
          </div>
        )}

        <div
          className={`p-6 ${showContextualHeader ? "pt-6" : embedded ? "pt-2" : "md:mt-4"}`}
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-6 @[720px]/specie-detail:grid-cols-[minmax(0,1.45fr)_minmax(16rem,1fr)] @[1180px]/specie-detail:grid-cols-[minmax(0,1.9fr)_minmax(18rem,1fr)]">
              <div className="flex min-w-0 flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <SpecieImageDetail
                    isFav={isFav}
                    showFavButton={!!userId && isInGallery}
                    onToggleFav={toggleFav}
                    favCount={favCount}
                    specieKey={specieKey}
                    initialImage={primaryImage}
                    quickActions={
                      detailQuickMenuSpecies ? (
                        <SpeciesCardQuickMenu
                          species={detailQuickMenuSpecies}
                          triggerClassName="rounded-full bg-black/40 p-2 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/50"
                          hideImageActions
                        />
                      ) : null
                    }
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <SpecieInfos />
                </motion.div>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <TaxonomyCard
                    specieDetail={specieDetail}
                    specieKey={specieKey!}
                    showViewInTree={!isFromTree}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {!isLoadingCache && (
                    <VulnerabilityBadge
                      statusCode={cache?.iucnCode ?? null}
                      trend={cache?.iucnTrend ?? null}
                      year={cache?.iucnYear ?? null}
                    />
                  )}
                </motion.div>

                {specieKey && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Suspense fallback={<OccurrenceMapFallback />}>
                      <OccurrenceMap specieKey={specieKey} />
                    </Suspense>
                  </motion.div>
                )}

                {specieKey && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-2"
                  >
                    <ListsWithSpecies gbifKey={specieKey} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog
        open={pendingUnfav}
        onOpenChange={(open) => {
          if (!open) setPendingUnfav(false);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("specieDetail.unfavTop4Title")}</DialogTitle>
            <DialogDescription>
              {t("specieDetail.unfavTop4Body")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => setPendingUnfav(false)}>
              {t("specieDetail.unfavTop4Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setPendingUnfav(false);
                void doToggleFav();
              }}
            >
              {t("specieDetail.unfavTop4Confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
