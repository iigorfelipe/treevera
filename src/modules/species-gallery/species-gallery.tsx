import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  X,
  Heart,
  Search,
  Images,
  ArrowUpDown,
  ImageOff,
  Image,
  Loader2,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";
import { SpeciesCard } from "@/modules/species-gallery/species-card";
import { Menu } from "@/modules/header/menu";
import { useGetGallerySpecies } from "@/hooks/queries/useGetUserSeenSpecies";

type SortOrder = "newest" | "oldest";

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

export const SpeciesGallery = ({
  userId,
  backUsername,
}: {
  userId?: string;
  backUsername?: string;
} = {}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const numColumns = useNumColumns();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0 && trimmed.length < 3) return;
    const id = setTimeout(() => setDebouncedSearch(trimmed), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [photosFirst, setPhotosFirst] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetGallerySpecies(
      {
        favoritesOnly: showOnlyFavorites,
        sortOrder,
        photosFirst,
        search: debouncedSearch || undefined,
      },
      userId,
    );

  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const allSpecies = useMemo(
    () => data?.pages.flatMap((p) => p.rows) ?? [],
    [data],
  );

  const columns = useMemo(() => {
    const cols = Array.from(
      { length: numColumns },
      () => [] as { species: GallerySpeciesRow; globalIndex: number }[],
    );
    allSpecies.forEach((species, i) => {
      cols[i % numColumns].push({ species, globalIndex: i });
    });
    return cols;
  }, [allSpecies, numColumns]);

  useEffect(() => {
    if (!hasNextPage || !sentinelRef.current || !scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: scrollRef.current, rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClose = useCallback(() => {
    if (backUsername) {
      navigate({ to: "/$username", params: { username: backUsername } });
    } else {
      navigate({ to: "/" });
    }
  }, [navigate, backUsername]);

  const handleSelectSpecies = useCallback(
    (species: GallerySpeciesRow) => {
      navigate({
        to: "/specie-detail/$specieKey",
        params: { specieKey: String(species.gbif_key) },
        search: { from: "gallery" },
      });
    },
    [navigate],
  );

  const toggleFavoritesFilter = useCallback(() => {
    setShowOnlyFavorites((prev) => !prev);
  }, []);

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
              {allSpecies.length === totalCount
                ? `${totalCount} ${t("gallery.species")}`
                : `${allSpecies.length} ${t("gallery.of")} ${totalCount}`}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!userId && <Menu />}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </div>
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
              {photosFirst ? (
                <Image className="size-3.5" />
              ) : (
                <ImageOff className="size-3.5" />
              )}
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
        {isLoading ? (
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex gap-4">
                {Array.from({ length: numColumns }).map((_, col) => (
                  <div key={col} className="flex min-w-0 flex-1 flex-col gap-4">
                    {Array.from({ length: 4 }).map((_, row) => (
                      <div
                        key={row}
                        className="bg-muted animate-pulse rounded-xl"
                        style={{ height: `${180 + (row % 3) * 40}px` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : allSpecies.length === 0 && !isFetchingNextPage ? (
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
                        key={species.gbif_key}
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
                        />
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
              {hasNextPage && (
                <div
                  ref={sentinelRef}
                  className="flex items-center justify-center py-8"
                >
                  {isFetchingNextPage && (
                    <Loader2 className="text-muted-foreground size-6 animate-spin" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
