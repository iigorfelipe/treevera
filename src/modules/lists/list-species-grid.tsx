import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SpeciesCard } from "@/modules/species-gallery/species-card";
import type { ListSpeciesRow } from "@/common/types/lists";
import type { GallerySpeciesRow } from "@/common/utils/supabase/user-seen-species";

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
    is_favorite: row.is_favorite,
    seen_at: "",
    total_count: row.total_count,
  };
}

type ListSpeciesGridProps = {
  species: ListSpeciesRow[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
};

export const ListSpeciesGrid = ({
  species,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  scrollRef,
}: ListSpeciesGridProps) => {
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, scrollRef]);

  const handleSelectSpecies = (gbifKey: number) => {
    navigate({
      to: "/specie-detail/$specieKey",
      params: { specieKey: String(gbifKey) },
      search: { from: "list" },
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
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
                >
                  <SpeciesCard
                    species={toGalleryRow(s)}
                    onClick={() => handleSelectSpecies(s.gbif_key)}
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
  );
};
