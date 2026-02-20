import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { X, Heart, Search, Images, ArrowUpDown } from "lucide-react";
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

export const SpeciesGallery = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);

  const allSpecies = useMemo(
    () => userDb?.game_info?.seen_species ?? [],
    [userDb],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filteredSpecies = useMemo(() => {
    let result = [...allSpecies];

    if (showOnlyFavorites) {
      result = result.filter((s) => s.fav);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allSpecies, showOnlyFavorites, sortOrder]);

  const handleClose = useCallback(() => {
    setSelectedSpecieKey(null);
    navigate({ to: "/profile" });
  }, [navigate, setSelectedSpecieKey]);

  const handleSelectSpecies = useCallback(
    (species: SeenSpecies) => {
      console.log("Selecionando espécie:", species.key);
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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-background/95 relative z-10 border-b px-4 py-3 shadow-sm backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-linear-to-r from-blue-500 to-indigo-500 p-2">
              <Images className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-foreground text-lg font-bold">
                {t("gallery.title")}
              </h1>
              <p className="text-muted-foreground text-xs">
                {filteredSpecies.length === allSpecies.length
                  ? `${allSpecies.length} ${t("gallery.species")}`
                  : `${filteredSpecies.length} ${t("gallery.of")} ${allSpecies.length}`}
                {favoritesCount > 0 && (
                  <span className="ml-2">
                    • {favoritesCount}{" "}
                    <Heart className="inline size-3 fill-current text-red-500" />
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="relative max-w-md min-w-50 flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("gallery.searchPlaceholder")}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="bg-background focus:border-primary h-10 pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-2">
                  <ArrowUpDown className="size-4" />
                  <span className="hidden sm:inline">
                    {sortOrder === "newest" ? t("gallery.newest") : t("gallery.oldest")}
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
              onClick={toggleFavoritesFilter}
              variant={showOnlyFavorites ? "default" : "outline"}
              size="sm"
              className="h-10"
            >
              <Heart
                className={`size-4 ${showOnlyFavorites ? "fill-current" : ""}`}
              />
              <span className="ml-2 hidden sm:inline">{t("gallery.favorites")}</span>
            </Button>

            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
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
              <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
                {filteredSpecies.map((species, index) => (
                  <motion.div
                    key={species.key}
                    className="mb-4 break-inside-avoid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02, duration: 0.25 }}
                  >
                    <SpeciesCard
                      species={species}
                      onClick={() => handleSelectSpecies(species)}
                      searchQuery={searchQuery}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
