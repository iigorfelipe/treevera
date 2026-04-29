import { useState, useEffect, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getRankIcon } from "@/common/utils/tree/ranks";
import { Image } from "@/common/components/image";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import {
  useGetSpecieGallery,
  type GalleryImage,
} from "@/hooks/queries/useGetSpecieGallery";
import { inatImageUrl } from "@/common/utils/image-size";
import { SkeletonImage } from "@/modules/specie-detail/skeletons";
import { Skeleton } from "@/common/components/ui/skeleton";
import { KEY_KINGDOM_BY_NAME } from "@/common/constants/tree";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { ImageWithZoom } from "@/common/components/image-with-zoom";
import { cn } from "@/common/utils/cn";
import { SourceReference } from "@/common/components/source-info/source-reference";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

type Props = {
  isFav: boolean;
  showFavButton?: boolean;
  onToggleFav?: () => void;
  favCount?: number;
  specieKey?: number;
  quickActions?: ReactNode;
  initialImage?: GalleryImage | null;
};

function getSourceIdFromName(source?: string) {
  if (!source) return null;
  if (source === "GBIF") return "gbif" as const;
  if (source === "iNaturalist") return "inaturalist" as const;
  if (source === "Wikipedia") return "wikipedia" as const;
  if (source === "Wikimedia Commons") return "wikimedia-commons" as const;
  return null;
}

export const SpecieImageDetail = ({
  isFav,
  showFavButton = false,
  onToggleFav,
  favCount = 0,
  specieKey,
  quickActions,
  initialImage,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;
  const specieKeyFromStore = selectedKey ?? treeSpecieKey;

  const { data: specieDetail } = useGetSpecieDetail({
    specieKey: specieKeyFromStore,
  });

  const canonicalName =
    specieDetail?.canonicalName || specieDetail?.scientificName;

  const { data: gallery = [], isLoading: isLoadingGallery } =
    useGetSpecieGallery(specieKeyFromStore, canonicalName);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(favCount);

  useEffect(() => {
    setOptimisticCount(favCount);
  }, [favCount]);

  useEffect(() => {
    setSelectedIndex(0);
    setImageLoading(false);
    setIsFallback(false);
  }, [specieKeyFromStore]);

  if (!specieDetail) return null;

  const fallbackImage = getRankIcon(
    KEY_KINGDOM_BY_NAME[specieDetail.kingdom.toLowerCase() as "animalia"],
  );

  const initialImageAlreadyInGallery =
    !!initialImage && gallery.some((img) => img.imgUrl === initialImage.imgUrl);

  const displayGallery =
    gallery.length > 0
      ? initialImage && !initialImageAlreadyInGallery
        ? [...gallery, initialImage]
        : gallery
      : initialImage
        ? [initialImage]
        : [];

  if (isLoadingGallery && displayGallery.length === 0) {
    return <SkeletonImage />;
  }

  const currentImage = displayGallery[selectedIndex] ?? null;
  const showThumbnailSkeletons =
    isLoadingGallery && displayGallery.length > 0 && gallery.length === 0;

  const showCounter = optimisticCount > 0;

  const goTo = (index: number) => {
    if (index === selectedIndex) return;
    setSelectedIndex(index);
    setImageLoading(true);
    setIsFallback(false);
  };

  const goPrev = () =>
    goTo((selectedIndex - 1 + displayGallery.length) % displayGallery.length);
  const goNext = () => goTo((selectedIndex + 1) % displayGallery.length);

  const handleFavToggle = () => {
    if (!isFav) {
      setOptimisticCount((c) => c + 1);
    } else {
      setOptimisticCount((c) => Math.max(c - 1, 0));
    }
    onToggleFav?.();
  };

  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!specieKey) return;
    void navigate({
      to: "/specie-detail/$specieKey/likes",
      params: { specieKey: String(specieKey) },
    });
  };

  if (displayGallery.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed p-4 text-center text-sm">
        <Image
          src={fallbackImage}
          alt={specieDetail.scientificName}
          className="max-h-48 opacity-30"
        />
        <span>{t("specieDetail.imageNotFound")}</span>
        <div className="rounded-md border p-3 text-xs">
          <p>
            <Trans
              i18nKey="specieDetail.imageNote"
              components={{
                inat: (
                  <SourceReference sourceId="inaturalist">
                    iNaturalist
                  </SourceReference>
                ),
                commons: (
                  <SourceReference sourceId="wikimedia-commons">
                    Wikimedia Commons
                  </SourceReference>
                ),
                gbif: <SourceReference sourceId="gbif">GBIF</SourceReference>,
                wikipedia: (
                  <SourceReference sourceId="wikipedia">
                    Wikipedia
                  </SourceReference>
                ),
              }}
            />
          </p>
        </div>

        <a
          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
            specieDetail.canonicalName,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {t("specieDetail.viewOnGoogle")}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="group relative aspect-4/3 overflow-hidden rounded-xl bg-black/10">
        <ImageWithZoom
          src={
            currentImage
              ? inatImageUrl(currentImage.imgUrl, "large")
              : fallbackImage
          }
          zoomSrc={isFallback ? fallbackImage : currentImage?.imgUrl}
          fallbackSrc={fallbackImage}
          alt={t("specieDetail.speciesImageAlt", {
            name: specieDetail.scientificName,
          })}
          onFallbackChange={setIsFallback}
          onLoad={() => setImageLoading(false)}
          zoom={3}
          contain
        />

        {isFallback && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-md bg-black/60 px-3 py-2 text-center text-xs text-white shadow-sm backdrop-blur-sm">
            <p className="font-medium">{t("specieDetail.imageNotFound")}</p>
            <p className="mt-0.5 text-white/75">
              {t("specieDetail.imageUnavailableHint")}
            </p>
          </div>
        )}

        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <Loader2 className="size-6 animate-spin text-white" />
          </div>
        )}

        {displayGallery.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="group/prev absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-colors duration-150 group-hover:opacity-100 hover:bg-black/60"
              aria-label={t("specieDetail.previousImage")}
            >
              <ChevronLeft className="size-5 transition-transform duration-200 group-hover/prev:-translate-x-0.5 group-hover/prev:scale-125 group-active/prev:scale-90" />
            </button>
            <button
              onClick={goNext}
              className="group/next absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-colors duration-150 group-hover:opacity-100 hover:bg-black/60"
              aria-label={t("specieDetail.nextImage")}
            >
              <ChevronRight className="size-5 transition-transform duration-200 group-hover/next:translate-x-0.5 group-hover/next:scale-125 group-active/next:scale-90" />
            </button>
          </>
        )}

        {(showFavButton || quickActions) && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            {showFavButton && (
              <div className="flex flex-row-reverse items-center">
                <AnimatePresence>
                  {showCounter && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <Tooltip delayDuration={120}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleCountClick}
                            className="h-8 cursor-pointer rounded-l-none rounded-r-full bg-black/40 px-2.5 text-xs font-medium whitespace-nowrap text-white tabular-nums backdrop-blur-sm transition-all duration-150 hover:bg-black/50 active:scale-95"
                            aria-label={t("specieDetail.viewFavoriters")}
                          >
                            {optimisticCount}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {t("specieDetail.whoLiked")}
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Tooltip delayDuration={120}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={handleFavToggle}
                      className={cn(
                        "group/heart size-8 cursor-pointer bg-black/40 p-0 backdrop-blur-sm transition-colors hover:bg-black/60",
                        showCounter
                          ? "rounded-l-full rounded-r-none"
                          : "rounded-full",
                      )}
                      aria-label={
                        isFav
                          ? t("specieDetail.removeFavorite")
                          : t("specieDetail.favorite")
                      }
                    >
                      <Heart
                        className={cn(
                          "mx-auto size-4 transition-transform duration-200 group-hover/heart:scale-125 group-hover/heart:-rotate-12 group-active/heart:scale-90",
                          isFav ? "fill-red-500 text-red-500" : "text-white",
                        )}
                      />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isFav
                      ? t("specieDetail.removeFavorite")
                      : t("specieDetail.favorite")}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            {quickActions}
          </div>
        )}

        {currentImage?.source && !isFallback && (
          <div className="absolute right-2 bottom-2">
            <p className="rounded bg-black/55 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">
              {t("specieDetail.imageSource")}:{" "}
              {(() => {
                const sourceId = getSourceIdFromName(currentImage.source);
                if (!sourceId) return currentImage.source;

                return (
                  <SourceReference
                    sourceId={sourceId}
                    className="text-white hover:text-white/80"
                  >
                    {currentImage.source}
                  </SourceReference>
                );
              })()}
              {currentImage.author && ` · @${currentImage.author.trim()}`}
              {currentImage.licenseCode && ` · ${currentImage.licenseCode}`}
            </p>
          </div>
        )}

        {displayGallery.length > 1 && (
          <>
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-linear-to-t from-black/40 to-transparent" />
          </>
        )}

        {displayGallery.length > 1 && (
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-1">
            {displayGallery.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  i === selectedIndex
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/70",
                )}
                aria-label={t("specieDetail.photo", { number: i + 1 })}
              />
            ))}
          </div>
        )}
      </div>

      {showThumbnailSkeletons ? (
        <div className="specie-gallery-scrollbar flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-14 shrink-0 rounded-lg" />
          ))}
        </div>
      ) : displayGallery.length > 1 ? (
        <div className="specie-gallery-scrollbar flex gap-2 overflow-x-auto pb-1">
          {displayGallery.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              title={[
                img.source,
                img.author ? `@${img.author.trim()}` : null,
                img.licenseCode || null,
              ]
                .filter(Boolean)
                .join(" · ")}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === selectedIndex
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image
                src={inatImageUrl(img.imgUrl, "small")}
                fallbackSrc={fallbackImage}
                alt={t("specieDetail.photo", { number: i + 1 })}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
