import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getRankIcon } from "@/common/utils/tree/ranks";
import { Image } from "@/common/components/image";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetSpecieGallery } from "@/hooks/queries/useGetSpecieGallery";
import { SkeletonImage } from "@/modules/specie-detail/skeletons";
import { KEY_KINGDOM_BY_NAME } from "@/common/constants/tree";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { ImageWithZoom } from "@/common/components/image-with-zoom";
import { cn } from "@/common/utils/cn";

type Props = {
  favImageUrl: string | null;
  showFavButton?: boolean;
  onToggleFav?: (imgUrl: string | null) => void;
  favCount?: number;
  specieKey?: number;
};

export const SpecieImageDetail = ({
  favImageUrl,
  showFavButton = false,
  onToggleFav,
  favCount = 0,
  specieKey,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;
  const specieKeyFromStore = selectedKey ?? treeSpecieKey;

  const { data: specieDetail } = useGetSpecieDetail({
    specieKey: specieKeyFromStore!,
  });

  const canonicalName =
    specieDetail?.canonicalName || specieDetail?.scientificName;

  const { data: gallery = [], isLoading: isLoadingGallery } =
    useGetSpecieGallery(specieKeyFromStore, canonicalName);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFallback, setIsFallback] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(favCount);

  useEffect(() => {
    setOptimisticCount(favCount);
  }, [favCount]);

  if (!specieDetail) return null;

  const fallbackImage = getRankIcon(
    KEY_KINGDOM_BY_NAME[specieDetail.kingdom.toLowerCase() as "animalia"],
  );

  if (isLoadingGallery) {
    return <SkeletonImage />;
  }

  const currentImage = gallery[selectedIndex] ?? null;
  const isFav = favImageUrl !== null;
  const isFavCurrentImage =
    favImageUrl !== null && currentImage?.imgUrl === favImageUrl;

  const showCounter = optimisticCount > 0;

  const goTo = (index: number) => {
    setSelectedIndex(index);
    setIsFallback(false);
  };

  const goPrev = () =>
    goTo((selectedIndex - 1 + gallery.length) % gallery.length);
  const goNext = () => goTo((selectedIndex + 1) % gallery.length);

  const handleFavToggle = () => {
    if (!isFav) {
      setOptimisticCount((c) => c + 1);
    } else if (isFavCurrentImage) {
      setOptimisticCount((c) => Math.max(c - 1, 0));
    }
    onToggleFav?.(currentImage?.imgUrl ?? null);
  };

  const handleCountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!specieKey) return;
    void navigate({
      to: "/specie-detail/$specieKey/likes",
      params: { specieKey: String(specieKey) },
    });
  };

  if (gallery.length === 0 || isFallback) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed p-4 text-center text-sm">
        <Image
          src={fallbackImage}
          alt={specieDetail.scientificName}
          className="max-h-48 opacity-30"
        />
        <span>{t("specieDetail.imageNotFound")}</span>
        <div className="rounded-md border p-3 text-xs">
          <p>{t("specieDetail.imageNote")}</p>
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
          src={currentImage?.imgUrl ?? fallbackImage}
          fallbackSrc={fallbackImage}
          alt={t("specieDetail.speciesImageAlt", {
            name: specieDetail.scientificName,
          })}
          onFallbackChange={setIsFallback}
          zoom={3}
          contain
        />

        {gallery.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              aria-label={t("specieDetail.previousImage")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
              aria-label={t("specieDetail.nextImage")}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {showFavButton && (
          <div className="absolute top-2 right-2 flex flex-row-reverse items-center">
            <AnimatePresence>
              {showCounter && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={handleCountClick}
                    className="h-9 rounded-l-none rounded-r-full bg-black/40 px-2.5 text-xs font-medium whitespace-nowrap text-white tabular-nums backdrop-blur-sm"
                    aria-label={t("specieDetail.viewFavoriters")}
                  >
                    {optimisticCount}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavToggle}
              className={cn(
                "bg-black/40 p-2 backdrop-blur-sm transition-all",
                showCounter ? "rounded-l-full rounded-r-none" : "rounded-full",
              )}
              aria-label={
                isFavCurrentImage
                  ? t("specieDetail.removeFavorite")
                  : t("specieDetail.favorite")
              }
            >
              <Heart
                className={cn(
                  "size-5 transition-all",
                  isFavCurrentImage
                    ? "fill-red-500 text-red-500"
                    : "text-white hover:text-red-400",
                )}
              />
            </motion.button>
          </div>
        )}

        {currentImage?.source && (
          <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2">
            <p className="text-right text-xs text-white/80">
              {t("specieDetail.imageSource")}: {currentImage.source}
              {currentImage.author && ` · @${currentImage.author.trim()}`}
              {currentImage.licenseCode && ` · ${currentImage.licenseCode}`}
            </p>
          </div>
        )}

        {gallery.length > 1 && (
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-1">
            {gallery.map((_, i) => (
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

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === selectedIndex
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img
                src={img.imgUrl}
                alt={t("specieDetail.photo", { number: i + 1 })}
                className="h-full w-full object-cover"
              />
              {favImageUrl === img.imgUrl && (
                <div className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5">
                  <Heart className="size-2.5 fill-red-500 text-red-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
