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
import { Heart, ImageOff, Layers, Search, X } from "lucide-react";
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

type TaxonomicGroup = {
  rank: Rank;
  key: number;
  name: string;
  species: ListTreeSpecies[];
};

const GROUP_RANKS: Rank[] = ["PHYLUM", "CLASS", "ORDER", "FAMILY", "GENUS"];
const EMPTY_LIST_TREE_SPECIES: ListTreeSpecies[] = [];
const DETAIL_SIDE_BY_SIDE_WIDTH = 1120;

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

const buildGroups = (species: ListTreeSpecies[]) =>
  GROUP_RANKS.map((rank) => {
    const groups = new Map<number, TaxonomicGroup>();

    for (const item of species) {
      const rankNode = item.ranks[rank];
      if (!rankNode?.name) continue;

      const current = groups.get(rankNode.key);
      if (current) {
        current.species.push(item);
      } else {
        groups.set(rankNode.key, {
          rank,
          key: rankNode.key,
          name: rankNode.name,
          species: [item],
        });
      }
    }

    return Array.from(groups.values())
      .sort((a, b) => b.species.length - a.species.length)
      .slice(0, 5);
  }).filter((groups) => groups.length > 0);

const DetailFallback = () => (
  <div className="bg-card h-96 animate-pulse rounded-xl border" />
);

const EmptyDetail = () => {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card flex min-h-80 flex-col justify-center rounded-xl border p-6 text-center">
      <ImageOff className="text-muted-foreground mx-auto mb-3 size-10 opacity-50" />
      <h2 className="text-foreground text-base font-semibold">
        {t("listTreePanel.selectSpeciesTitle")}
      </h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm leading-6">
        {t("listTreePanel.selectSpeciesDescription")}
      </p>
    </div>
  );
};

export const ListTreePanel = () => {
  const { t } = useTranslation();
  const listTreeMode = useAtomValue(treeAtom.listTreeMode);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const selectedSpecieKey = useAtomValue(selectedSpecieKeyAtom);
  const setSelectedSpecieKey = useSetAtom(selectedSpecieKeyAtom);
  const setExpandedPath = useSetAtom(setExpandedPathAtom);
  const scrollToNodeKey = useSetAtom(scrollToNodeKeyAtom);
  const panelRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>(null);
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

  const baseFilteredSpecies = useMemo(
    () =>
      species.filter(
        (item) =>
          speciesMatchesSearch(item, normalizedQuery) &&
          (!favoriteOnly || item.isFavorite),
      ),
    [favoriteOnly, normalizedQuery, species],
  );

  const filteredSpecies = useMemo(
    () =>
      baseFilteredSpecies.filter((item) =>
        speciesMatchesGroup(item, groupFilter),
      ),
    [baseFilteredSpecies, groupFilter],
  );

  const groups = useMemo(
    () => buildGroups(baseFilteredSpecies),
    [baseFilteredSpecies],
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

  const hasFilters = !!query || favoriteOnly || !!groupFilter;

  const selectSpecies = useCallback(
    (item: ListTreeSpecies) => {
      setSelectedSpecieKey(item.gbifKey);
      setExpandedPath(item.path);
      scrollToNodeKey(item.gbifKey);

      if ((panelRef.current?.clientWidth ?? Infinity) < DETAIL_SIDE_BY_SIDE_WIDTH) {
        setDetailScrollRequest((value) => value + 1);
      }
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
    setGroupFilter(null);
  }, []);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  if (!listTreeMode) return null;

  return (
    <main
      ref={panelRef}
      className="text-foreground @container/list-tree-panel min-h-screen min-w-0 overflow-x-hidden bg-transparent px-5 py-5 @[760px]/list-tree-panel:px-6"
    >
      <div className="mx-auto grid w-full max-w-[96rem] gap-5 @[1120px]/list-tree-panel:grid-cols-[minmax(0,51.875rem)_minmax(20rem,1fr)]">
        <section className="min-w-0 space-y-5 @[1120px]/list-tree-panel:max-w-[830px]">
          <header className="border-border bg-card flex min-w-0 items-center gap-2 rounded-xl border p-2">
            <form
              onSubmit={handleSearchSubmit}
              className="border-border bg-background/50 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border px-3"
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
            </form>

            <div className="flex shrink-0 gap-1.5">
              <Button
                type="button"
                variant={favoriteOnly ? "default" : "outline"}
                size="icon"
                className="size-10 cursor-pointer"
                aria-pressed={favoriteOnly}
                aria-label={t("listTreePanel.favoriteFilter")}
                title={t("listTreePanel.favoriteFilter")}
                onClick={() => setFavoriteOnly((value) => !value)}
              >
                <Heart
                  className={cn(
                    "size-4",
                    favoriteOnly && "fill-current",
                  )}
                />
              </Button>

              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 cursor-pointer"
                  aria-label={t("listTreePanel.clearFilters")}
                  title={t("listTreePanel.clearFilters")}
                  onClick={clearFilters}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </header>

          <section
            aria-label={t("listTreePanel.galleryLabel")}
            className="border-border bg-card rounded-xl border p-3"
          >
            <div className="max-h-60 overflow-y-auto pr-1">
              {filteredSpecies.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,3.25rem))] gap-2">
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
                          "border-border bg-muted group relative size-13 cursor-pointer overflow-hidden rounded-lg border transition-all hover:-translate-y-0.5 hover:border-foreground/30",
                          active &&
                            "border-primary ring-primary/30 ring-2 ring-offset-2 ring-offset-background",
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

          <section className="border-border bg-card rounded-xl border p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="text-primary size-4" />
                  <h2 className="text-base font-semibold">
                    {t("listTreePanel.mapTitle")}
                  </h2>
                </div>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {t("listTreePanel.mapDescription")}
                </p>
              </div>

              {groupFilter && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 cursor-pointer"
                  onClick={() => setGroupFilter(null)}
                >
                  <X className="size-3.5" />
                  {t("listTreePanel.clearGroup")}
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {groups.map((rankGroups) => {
                const rank = rankGroups[0].rank;
                const max = Math.max(
                  ...rankGroups.map((group) => group.species.length),
                  1,
                );

                return (
                  <div
                    key={rank}
                    className="grid gap-2 @[720px]/list-tree-panel:grid-cols-[5.5rem_1fr]"
                  >
                    <div className="text-muted-foreground pt-2 text-xs font-bold tracking-wide uppercase">
                      {t(`ranks.${rank}`)}
                    </div>

                    <div className="flex min-w-0 flex-wrap gap-2">
                      {rankGroups.map((group) => {
                        const strength = group.species.length / max;
                        const selected =
                          groupFilter?.rank === group.rank &&
                          groupFilter.key === group.key;
                        const previewSpecies = group.species.slice(0, 4);

                        return (
                          <button
                            key={`${group.rank}-${group.key}`}
                            type="button"
                            onClick={() =>
                              setGroupFilter(
                                selected
                                  ? null
                                  : {
                                      rank: group.rank,
                                      key: group.key,
                                      name: group.name,
                                    },
                              )
                            }
                            className={cn(
                              "border-border bg-background/50 hover:bg-muted/60 min-w-36 max-w-full cursor-pointer rounded-lg border px-3 py-2 text-left transition-colors",
                              selected && "border-primary bg-primary/10",
                            )}
                            style={{
                              flexGrow: Math.max(1, strength * 3),
                            }}
                          >
                            <span className="text-foreground block truncate text-sm font-medium">
                              {group.name}
                            </span>
                            <span className="mt-2 flex min-h-5 -space-x-1.5">
                              {previewSpecies.map((item) => {
                                const imageSrc = getThumbSrc(item.imageUrl);

                                return (
                                  <span
                                    key={item.gbifKey}
                                    className="border-background bg-muted inline-flex size-5 overflow-hidden rounded-sm border"
                                  >
                                    {imageSrc ? (
                                      <Image
                                        src={imageSrc}
                                        alt=""
                                        className="size-full object-cover"
                                      />
                                    ) : null}
                                  </span>
                                );
                              })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        <aside ref={detailRef} className="scroll-mt-5 min-w-0">
          <div className="@[1120px]/list-tree-panel:sticky @[1120px]/list-tree-panel:top-5">
            {activeSpecies ? (
              <Suspense fallback={<DetailFallback />}>
                <SpecieDetail embedded showBackHeader={false} />
              </Suspense>
            ) : (
              <EmptyDetail />
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};
