import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { X, Heart, Search, Images, ArrowUpDown, ImageOff } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import type { SeenSpecies } from "@/common/types/user";
import { SpeciesCard } from "@/modules/species-gallery/species-card";
import { selectedSpecieKeyAtom } from "@/store/tree";

type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 20;

const useNumColumns = () => {
  const [numColumns, setNumColumns] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setNumColumns(5);
      else if (w >= 1024) setNumColumns(4);
      else if (w >= 768) setNumColumns(3);
      else if (w >= 640) setNumColumns(2);
      else setNumColumns(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return numColumns;
};

export const SpeciesGallery = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);
  const numColumns = useNumColumns();

  const allSpecies = useMemo(
    () => userDb?.game_info?.seen_species ?? [],
    [userDb],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [photosFirst, setPhotosFirst] = useState(true);
  const [imageStatus, setImageStatus] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleImageResolved = useCallback((key: number, hasImage: boolean) => {
    setImageStatus((prev) => {
      if (prev[key] === hasImage) return prev;
      return { ...prev, [key]: hasImage };
    });
  }, []);

  const filteredSpecies = useMemo(() => {
    let result = [...allSpecies];

    if (showOnlyFavorites) {
      result = result.filter((s) => s.fav);
    }

    result.sort((a, b) => {
      if (photosFirst) {
        const aNoImage = imageStatus[a.key] === false;
        const bNoImage = imageStatus[b.key] === false;
        if (aNoImage !== bNoImage) return aNoImage ? 1 : -1;
      }

      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allSpecies, showOnlyFavorites, sortOrder, photosFirst, imageStatus]);

  const visibleSpecies = filteredSpecies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSpecies.length;

  const columns = useMemo(() => {
    const cols = Array.from(
      { length: numColumns },
      () => [] as { species: SeenSpecies; globalIndex: number }[],
    );
    visibleSpecies.forEach((species, i) => {
      cols[i % numColumns].push({ species, globalIndex: i });
    });
    return cols;
  }, [visibleSpecies, numColumns]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [showOnlyFavorites, sortOrder, photosFirst, searchQuery]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || !scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + PAGE_SIZE);
        }
      },
      { root: scrollRef.current, rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  const handleClose = useCallback(() => {
    setSelectedSpecieKey(null);
    navigate({ to: "/profile" });
  }, [navigate, setSelectedSpecieKey]);

  const handleSelectSpecies = useCallback(
    (species: SeenSpecies) => {
      setSelectedSpecieKey(species.key);
    },
    [setSelectedSpecieKey],
  );

  const toggleFavoritesFilter = useCallback(() => {
    setShowOnlyFavorites((prev) => !prev);
  }, []);

  const favoritesCount = allSpecies.filter((s) => s.fav).length;

  if (!userDb) return null;

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-background/95 relative z-10 border-b backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-3 pb-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-base leading-tight font-bold">
              {t("gallery.title")}
            </h1>
            <span className="text-muted-foreground text-xs">
              {filteredSpecies.length === allSpecies.length
                ? `${allSpecies.length} ${t("gallery.species")}`
                : `${filteredSpecies.length} ${t("gallery.of")} ${allSpecies.length}`}
              {favoritesCount > 0 && (
                <span className="ml-1.5">
                  · {favoritesCount}{" "}
                  <Heart className="inline size-3 fill-current text-red-500" />
                </span>
              )}
            </span>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-3">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("gallery.searchPlaceholder")}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="bg-muted/50 focus:bg-background focus:border-border h-8 w-full rounded-lg border border-transparent pl-8 text-sm transition-colors outline-none"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5"
                >
                  <ArrowUpDown className="size-3.5" />
                  <span className="hidden text-xs sm:inline">
                    {sortOrder === "newest"
                      ? t("gallery.newest")
                      : t("gallery.oldest")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                  {t("gallery.newestFirst")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                  {t("gallery.oldestFirst")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => setPhotosFirst((prev) => !prev)}
              variant={photosFirst ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5 px-2.5"
              title={t("gallery.photosFirst")}
            >
              <ImageOff className="size-3.5" />
              <span className="hidden text-xs sm:inline">
                {t("gallery.photosFirst")}
              </span>
            </Button>

            <Button
              onClick={toggleFavoritesFilter}
              variant={showOnlyFavorites ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5 px-2.5"
            >
              <Heart
                className={`size-3.5 ${showOnlyFavorites ? "fill-current text-red-500" : ""}`}
              />
              <span className="hidden text-xs sm:inline">
                {t("gallery.favorites")}
              </span>
            </Button>
          </div>
        </div>
      </motion.div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {filteredSpecies.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <Images className="mx-auto mb-3 size-16 opacity-30" />
              <p className="mb-1 text-lg font-medium">
                {t("gallery.noSpeciesFound")}
              </p>
              <p className="text-sm">
                {showOnlyFavorites
                  ? t("gallery.noFavorites")
                  : t("gallery.adjustFilters")}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex gap-4">
                {columns.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex min-w-0 flex-1 flex-col gap-4"
                  >
                    {column.map(({ species, globalIndex }) => (
                      <motion.div
                        key={species.key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: globalIndex * 0.02,
                          duration: 0.25,
                        }}
                      >
                        <SpeciesCard
                          species={species}
                          onClick={() => handleSelectSpecies(species)}
                          searchQuery={searchQuery}
                          onImageResolved={handleImageResolved}
                        />
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
              {hasMore && <div ref={sentinelRef} className="h-4" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
