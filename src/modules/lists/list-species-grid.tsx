import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { SpeciesCard } from "@/modules/species-gallery/species-card";
import type { ListSpeciesRow } from "@/common/types/lists";
import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";
import { getSpeciesSlugParam } from "@/common/utils/species-url";

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

function toGalleryRow(row: ListSpeciesRow): GallerySpeciesRow {
  return {
    gbif_key: row.gbif_key,
    canonical_name: row.canonical_name,
    family: row.family,
    image_url: row.image_url,
    image_source: row.image_source,
    image_attribution: row.image_attribution,
    image_license: row.image_license,
    is_favorite: row.is_favorite,
    is_in_gallery: row.is_in_gallery,
    seen_at: "",
    total_count: row.total_count,
  };
}

type ListSpeciesGridProps = {
  species: ListSpeciesRow[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isOwner?: boolean;
  onRemove?: (gbifKey: number) => void;
  listId?: string;
  listUsername?: string;
  listSlug?: string;
};

export const ListSpeciesGrid = ({
  species,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isOwner = false,
  onRemove,
  listId,
  listUsername,
  listSlug,
}: ListSpeciesGridProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const numColumns = useNumColumns();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => {
    const cols = Array.from(
      { length: numColumns },
      () => [] as { species: ListSpeciesRow; globalIndex: number }[],
    );
    species.forEach((s, i) => {
      cols[i % numColumns].push({ species: s, globalIndex: i });
    });
    return cols;
  }, [species, numColumns]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasNextPage || !sentinel) return;

    const scrollRoot = sentinel.closest("[data-scroll-root]");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: scrollRoot, rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelectSpecies = (s: ListSpeciesRow) => {
    const speciesSlug = getSpeciesSlugParam(s.gbif_key, s.canonical_name);
    if (speciesSlug) {
      navigate({
        to: "/species/$speciesSlug",
        params: { speciesSlug },
        search: { from: "list" },
      });
      return;
    }

    navigate({
      to: "/specie-detail/$specieKey",
      params: { specieKey: String(s.gbif_key) },
      search: { from: "list" },
    });
  };

  return (
    <div className="mx-auto max-w-7xl py-6">
      <div className="flex gap-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex min-w-0 flex-1 flex-col gap-4">
            {column.map(({ species: s, globalIndex }) => (
              <motion.div
                key={s.gbif_key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: globalIndex * 0.02,
                  duration: 0.25,
                }}
                className="relative"
              >
                <SpeciesCard
                  species={toGalleryRow(s)}
                  onClick={() => handleSelectSpecies(s)}
                  listId={listId}
                  listUsername={listUsername}
                  listSlug={listSlug}
                  reserveTopRightActionSpace={isOwner && !!onRemove}
                />
                {isOwner && onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(s.gbif_key);
                    }}
                    className="absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    title={t("lists.removeFromList")}
                    aria-label={t("lists.removeFromList")}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
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
  );
};
