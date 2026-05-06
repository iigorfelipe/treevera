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
  CheckCircle2,
  Heart,
  ImageOff,
  Layers,
  MousePointerClick,
  Search,
  Shapes,
  X,
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
const BRANCH_CHILDREN_LIMIT = 6;

type BranchChildGroup = {
  rank: Rank;
  key: number;
  name: string;
  count: number;
};

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

const getBranchChildGroups = (
  species: ListTreeSpecies[],
  groupFilter: NonNullable<GroupFilter>,
) => {
  const groups = new Map<number, BranchChildGroup>();

  for (const item of species) {
    const branchIndex = item.path.findIndex(
      (node) => node.key === groupFilter.key,
    );
    const child = branchIndex >= 0 ? item.path[branchIndex + 1] : undefined;

    if (!child || child.rank === "SPECIES") continue;

    const current = groups.get(child.key);
    groups.set(child.key, {
      rank: child.rank,
      key: child.key,
      name: child.name,
      count: (current?.count ?? 0) + 1,
    });
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
};

const DetailFallback = () => (
  <div className="bg-card h-96 animate-pulse rounded-xl border" />
);

export const ListTreePanel = () => {
  const { t } = useTranslation();
  const listTreeMode = useAtomValue(treeAtom.listTreeMode);
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

  const activeKey =
    selectedSpecieKey != null && speciesKeys.has(selectedSpecieKey)
      ? selectedSpecieKey
      : null;

  const activeSpecies =
    activeKey != null
      ? species.find((item) => item.gbifKey === activeKey)
      : undefined;

  const branchSpecies = useMemo(
    () =>
      groupFilter
        ? species.filter((item) => speciesMatchesGroup(item, groupFilter))
        : [],
    [groupFilter, species],
  );
  const branchKnownCount = useMemo(
    () => branchSpecies.filter((item) => item.isKnown).length,
    [branchSpecies],
  );
  const branchFavoriteCount = useMemo(
    () => branchSpecies.filter((item) => item.isFavorite).length,
    [branchSpecies],
  );
  const branchKnowledgePercent =
    branchSpecies.length > 0
      ? Math.round((branchKnownCount / branchSpecies.length) * 100)
      : 0;
  const branchChildGroups = useMemo(
    () =>
      groupFilter
        ? getBranchChildGroups(branchSpecies, groupFilter).slice(
            0,
            BRANCH_CHILDREN_LIMIT,
          )
        : [],
    [branchSpecies, groupFilter],
  );

  const hasFilters =
    !!query || favoriteOnly || knowledgeFilter !== "all" || !!groupFilter;

  const selectSpecies = useCallback(
    (item: ListTreeSpecies) => {
      setGroupFilter(null);
      setSelectedSpecieKey(item.gbifKey);
      setExpandedPath(item.path);
      scrollToNodeKey(item.gbifKey);
      setDetailScrollRequest((value) => value + 1);
    },
    [scrollToNodeKey, setExpandedPath, setGroupFilter, setSelectedSpecieKey],
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

  const selectBranchGroup = useCallback(
    (group: BranchChildGroup) => {
      setSelectedSpecieKey(null);
      setGroupFilter({
        rank: group.rank,
        key: group.key,
        name: group.name,
      });
    },
    [setGroupFilter, setSelectedSpecieKey],
  );

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

          <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 @[520px]/list-tree-panel:flex @[520px]/list-tree-panel:flex-wrap">
            <Button
              type="button"
              variant={favoriteOnly ? "default" : "outline"}
              className="size-9 shrink-0 cursor-pointer p-0 @[520px]/list-tree-panel:h-9 @[520px]/list-tree-panel:w-auto @[520px]/list-tree-panel:px-3"
              aria-pressed={favoriteOnly}
              aria-label={t("listTreePanel.favoriteFilter")}
              title={t("listTreePanel.favoriteFilter")}
              onClick={() => setFavoriteOnly((value) => !value)}
            >
              <Heart className={cn("size-4", favoriteOnly && "fill-current")} />
              <span className="hidden text-sm @[520px]/list-tree-panel:inline">
                {t("listTreePanel.favoriteFilterShort")}
              </span>
            </Button>
            <Button
              type="button"
              variant={knowledgeFilter === "known" ? "default" : "outline"}
              className="h-9 min-w-0 cursor-pointer px-2.5 text-sm @[520px]/list-tree-panel:px-3"
              aria-pressed={knowledgeFilter === "known"}
              aria-label={t("lists.filterKnown")}
              title={t("lists.filterKnown")}
              onClick={() =>
                setKnowledgeFilter((value) =>
                  value === "known" ? "all" : "known",
                )
              }
            >
              <span className="truncate">
                {t("lists.filterKnown")}
              </span>
            </Button>
            <Button
              type="button"
              variant={knowledgeFilter === "unknown" ? "default" : "outline"}
              className="h-9 min-w-0 cursor-pointer px-2.5 text-sm @[520px]/list-tree-panel:px-3"
              aria-pressed={knowledgeFilter === "unknown"}
              aria-label={t("lists.filterUnknown")}
              title={t("lists.filterUnknown")}
              onClick={() =>
                setKnowledgeFilter((value) =>
                  value === "unknown" ? "all" : "unknown",
                )
              }
            >
              <span className="truncate">
                {t("lists.filterUnknown")}
              </span>
            </Button>

            {groupFilter && (
              <button
                type="button"
                onClick={() => setGroupFilter(null)}
                className="bg-muted hover:bg-muted/70 col-span-full inline-flex min-h-9 w-full min-w-0 max-w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs transition-colors @[520px]/list-tree-panel:col-auto @[520px]/list-tree-panel:w-auto @[520px]/list-tree-panel:rounded-full"
                title={`${t(`ranks.${groupFilter.rank}`)}: ${
                  groupFilter.name
                }`}
              >
                <span className="min-w-0 truncate">
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
                className="col-span-full h-9 cursor-pointer px-2 text-xs @[520px]/list-tree-panel:col-auto"
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
          ) : groupFilter ? (
            <div className="border-border bg-card rounded-xl border p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-muted-foreground text-xs font-medium">
                      {t("listTreePanel.branchRank", {
                        rank: t(`ranks.${groupFilter.rank}`),
                      })}
                    </p>
                    <h2 className="truncate text-lg font-semibold">
                      {groupFilter.name}
                    </h2>
                  </div>
                </div>

                {branchSpecies.length > 0 ? (
                  <>
                    <div className="grid gap-2 @[640px]/list-tree-panel:grid-cols-4">
                      <div className="rounded-lg border px-3 py-2">
                        <p className="text-xl font-semibold">
                          {branchSpecies.length}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("listTreePanel.branchSpecies")}
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2">
                        <p className="text-xl font-semibold">
                          {branchKnownCount}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("lists.filterKnown")}
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2">
                        <p className="text-xl font-semibold">
                          {branchSpecies.length - branchKnownCount}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("lists.filterUnknown")}
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2">
                        <p className="text-xl font-semibold">
                          {branchFavoriteCount}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("listTreePanel.favoriteFilterShort")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-muted-foreground size-4" />
                          <p className="text-sm font-medium">
                            {t("listTreePanel.branchKnowledgeTitle")}
                          </p>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {t("listTreePanel.branchKnowledgeValue", {
                            percent: branchKnowledgePercent,
                          })}
                        </p>
                      </div>
                      <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${branchKnowledgePercent}%` }}
                        />
                      </div>
                    </div>

                    {branchChildGroups.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shapes className="text-muted-foreground size-4" />
                          <p className="text-sm font-medium">
                            {t("listTreePanel.branchGroupsTitle")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {branchChildGroups.map((group) => (
                            <button
                              key={group.key}
                              type="button"
                              onClick={() => selectBranchGroup(group)}
                              className="hover:bg-muted/70 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors"
                              title={t("listTreePanel.branchGroupTitle", {
                                rank: t(`ranks.${group.rank}`),
                                name: group.name,
                              })}
                            >
                              <span className="truncate">{group.name}</span>
                              <span className="text-muted-foreground shrink-0">
                                {group.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t("listTreePanel.branchEmpty")}
                  </p>
                )}
              </div>
            </div>
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
