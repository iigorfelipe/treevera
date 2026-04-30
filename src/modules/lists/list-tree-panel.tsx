import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Heart,
  ImageOff,
  Layers,
  MousePointerClick,
  Search,
  X
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/common/components/ui/button";
import { Image } from "@/common/components/image";
import { cn } from "@/common/utils/cn";
import { inatImageUrl } from "@/common/utils/image-size";
import type { Rank } from "@/common/types/api";
import type { ListTreeSpecies } from "@/common/types/tree-atoms";
import {
  scrollToNodeKeyAtom,
  selectedSpecieKeyAtom,
  setExpandedPathAtom,
  treeAtom,
} from "@/store/tree";

const SpecieDetail = lazy(() =>
  import("@/app/details/specie-detail").then((module) => ({
    default: module.SpecieDetail,
  })),
);

type GroupFilter = {
  rank: Rank;
  key: number;
  name: string;
} | null;

type KnowledgeFilter = "all" | "known" | "unknown";

const EMPTY_LIST_TREE_SPECIES: ListTreeSpecies[] = [];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getThumbSrc = (url: string | null) =>
  url ? inatImageUrl(url, "square") : null;

const speciesMatchesSearch = (species: ListTreeSpecies, query: string) => {
  if (!query) return true;

  const haystack = normalizeText(
    [
      species.canonicalName,
      species.family,
      ...species.path.map((node) => node.name),
    ]
      .filter(Boolean)
      .join(" "),
  );

  return haystack.includes(query);
};

const speciesMatchesGroup = (
  species: ListTreeSpecies,
  groupFilter: GroupFilter,
) => {
  if (!groupFilter) return true;
  return species.ranks[groupFilter.rank]?.key === groupFilter.key;
};

const DetailFallback = () => (
  <div className="bg-card h-96 animate-pulse rounded-xl border" />
);

export const ListTreePanel = () => {
  const { t } = useTranslation();
  const listTreeMode = useAtomValue(treeAtom.listTreeMode);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const selectedSpecieKey = useAtomValue(selectedSpecieKeyAtom);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);
  const setExpandedPath = useSetAtom(setExpandedPathAtom);
  const scrollToNodeKey = useSetAtom(scrollToNodeKeyAtom);
  const groupFilter = useAtomValue(treeAtom.listTreeGroupFilter);
  const setGroupFilter = useSetAtom(treeAtom.listTreeGroupFilter);
  const detailRef = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [knowledgeFilter, setKnowledgeFilter] =
    useState<KnowledgeFilter>("all");
  const [detailScrollRequest, setDetailScrollRequest] = useState(0);

  const species = listTreeMode?.species ?? EMPTY_LIST_TREE_SPECIES;
  const normalizedQuery = useMemo(() => normalizeText(query.trim()), [query]);
  const speciesKeys = useMemo(
    () => new Set(species.map((item) => item.gbifKey)),
    [species],
  );

  useEffect(() => {
    if (selectedSpecieKey && !speciesKeys.has(selectedSpecieKey)) {
      setSelectedSpecieKey(null);
    }
  }, [selectedSpecieKey, setSelectedSpecieKey, speciesKeys]);

  const filteredSpecies = useMemo(
    () =>
      species.filter(
        (item) =>
          speciesMatchesSearch(item, normalizedQuery) &&
          speciesMatchesGroup(item, groupFilter) &&
          (!favoriteOnly || item.isFavorite) &&
          (knowledgeFilter === "all" ||
            (knowledgeFilter === "known" && item.isKnown) ||
            (knowledgeFilter === "unknown" && !item.isKnown)),
      ),
    [favoriteOnly, groupFilter, knowledgeFilter, normalizedQuery, species],
  );

  const treeSpecieKey = expandedNodes.find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const activeKey =
    selectedSpecieKey && speciesKeys.has(selectedSpecieKey)
      ? selectedSpecieKey
      : treeSpecieKey && speciesKeys.has(treeSpecieKey)
        ? treeSpecieKey
        : null;

  const activeSpecies =
    activeKey != null
      ? species.find((item) => item.gbifKey === activeKey)
      : undefined;

  const hasFilters =
    !!query || favoriteOnly || knowledgeFilter !== "all" || !!groupFilter;

  const selectSpecies = useCallback(
    (item: ListTreeSpecies) => {
      setSelectedSpecieKey(item.gbifKey);
      setExpandedPath(item.path);
      scrollToNodeKey(item.gbifKey);
      setDetailScrollRequest((value) => value + 1);
    },
    [scrollToNodeKey, setExpandedPath, setSelectedSpecieKey],
  );

  useEffect(() => {
    if (!detailScrollRequest || !activeKey) return;

    const frame = window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeKey, detailScrollRequest]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setFavoriteOnly(false);
    setKnowledgeFilter("all");
    setGroupFilter(null);
  }, [setGroupFilter]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  if (!listTreeMode) return null;

  return (
    <main className="text-foreground @container/list-tree-panel min-h-screen min-w-0 overflow-x-hidden px-4 py-4 @[760px]/list-tree-panel:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="space-y-3">
          <form
            onSubmit={handleSearchSubmit}
            className="border-border bg-card flex h-10 min-w-0 items-center gap-2 rounded-lg border px-3"
          >
            <Search className="text-muted-foreground size-4 shrink-0" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setGroupFilter(null);
              }}
              placeholder={t("listTreePanel.searchPlaceholder")}
              className="placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                aria-label={t("listTreePanel.clearFilters")}
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={favoriteOnly ? "default" : "outline"}
              className="h-9 cursor-pointer gap-2 px-3"
              aria-pressed={favoriteOnly}
              aria-label={t("listTreePanel.favoriteFilter")}
              title={t("listTreePanel.favoriteFilter")}
              onClick={() => setFavoriteOnly((value) => !value)}
            >
              <Heart className={cn("size-4", favoriteOnly && "fill-current")} />
              <span className="hidden text-sm @[420px]/list-tree-panel:inline">
                {t("listTreePanel.favoriteFilterShort")}
              </span>
            </Button>
            <Button
              type="button"
              variant={knowledgeFilter === "known" ? "default" : "outline"}
              className="h-9 cursor-pointer gap-2 px-3"
              aria-pressed={knowledgeFilter === "known"}
              aria-label={t("lists.filterKnown")}
              title={t("lists.filterKnown")}
              onClick={() =>
                setKnowledgeFilter((value) =>
                  value === "known" ? "all" : "known",
                )
              }
            >
              
              <span className="hidden text-sm @[420px]/list-tree-panel:inline">
                {t("lists.filterKnown")}
              </span>
            </Button>
            <Button
              type="button"
              variant={knowledgeFilter === "unknown" ? "default" : "outline"}
              className="h-9 cursor-pointer gap-2 px-3"
              aria-pressed={knowledgeFilter === "unknown"}
              aria-label={t("lists.filterUnknown")}
              title={t("lists.filterUnknown")}
              onClick={() =>
                setKnowledgeFilter((value) =>
                  value === "unknown" ? "all" : "unknown",
                )
              }
            >
             
              <span className="hidden text-sm @[420px]/list-tree-panel:inline">
                {t("lists.filterUnknown")}
              </span>
            </Button>

            {groupFilter && (
              <button
                type="button"
                onClick={() => setGroupFilter(null)}
                className="bg-muted hover:bg-muted/70 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs transition-colors"
              >
                <span className="truncate">
                  {t(`ranks.${groupFilter.rank}`)}: {groupFilter.name}
                </span>
                <X className="size-3.5 shrink-0" />
              </button>
            )}

            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 cursor-pointer px-2 text-xs"
                onClick={clearFilters}
              >
                {t("listTreePanel.clearFilters")}
              </Button>
            )}
          </div>
        </header>

        <section className="border-b">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="text-sm font-semibold">
                {t("listTreePanel.galleryTitle")}
              </h2>
              |
              <p className="text-muted-foreground text-xs">
                {t("listTreePanel.showingCount", {
                  visible: filteredSpecies.length,
                  total: species.length,
                })}
              </p>
            </div>
          </div>

          <div className="h-36.5 overflow-y-auto pr-1">
            {filteredSpecies.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,3.25rem))] gap-2 py-2">
                {filteredSpecies.map((item) => {
                  const imageSrc = getThumbSrc(item.imageUrl);
                  const active = item.gbifKey === activeKey;

                  return (
                    <button
                      key={item.gbifKey}
                      type="button"
                      title={item.canonicalName}
                      aria-label={item.canonicalName}
                      onClick={() => selectSpecies(item)}
                      className={cn(
                        "border-border bg-muted group hover:border-foreground/30 relative size-13 cursor-pointer overflow-hidden rounded-lg border transition-all hover:-translate-y-0.5",
                        active &&
                          "border-primary ring-primary/30 ring-offset-background ring-2 ring-offset-2",
                      )}
                    >
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt=""
                          className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <ImageOff className="text-muted-foreground size-4" />
                        </div>
                      )}
                      {item.isFavorite && (
                        <Heart className="absolute top-1 right-1 size-3 fill-white text-white drop-shadow" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground flex min-h-28 items-center justify-center text-center text-sm">
                {t("listTreePanel.noMatches")}
              </div>
            )}
          </div>
        </section>

        <section ref={detailRef} className="scroll-mt-4 mt-12">
          {activeSpecies ? (
            <Suspense fallback={<DetailFallback />}>
              <SpecieDetail embedded showBackHeader={false} />
            </Suspense>
          ) : (
            <div className="border-border bg-card rounded-xl border p-4">
              <div className="flex gap-3">
                <MousePointerClick className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm leading-6">
                  {t("listTreePanel.guideStepSpecies")}
                </p>
              </div>
              <div className="mt-2 flex gap-3">
                <Layers className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <p className="text-muted-foreground text-sm leading-6">
                  {t("listTreePanel.guideStepGroups")}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
