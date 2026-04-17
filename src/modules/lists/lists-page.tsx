import { useState, useMemo, useEffect, useRef, startTransition } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  Plus,
  Loader2,
  ListX,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import {
  useGetPublicLists,
  useGetFeaturedLists,
  useSetFeaturedLists,
} from "@/hooks/queries/useGetLists";
import { slugify } from "@/common/utils/slugify";
import { ListCard } from "./list-card";
import { ListCompactCard } from "./list-compact-card";
import { ListCoverCollage } from "./list-cover-collage";
import { ListCreateDialog } from "./list-create-dialog";
import { ListViewToggle, type ListViewMode } from "./list-view-toggle";
import type { ListWithCreator } from "@/common/types/lists";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useResponsive } from "@/hooks/use-responsive";

const ADMIN_USERNAME = "treevera";
const MAX_FEATURED = 3;

const FeaturedListCard = ({
  list,
  editMode,
  onRemove,
}: {
  list: ListWithCreator;
  editMode: boolean;
  onRemove: () => void;
}) => {
  const navigate = useNavigate();
  const listSlug = list.slug || slugify(list.title);

  return (
    <div
      onClick={() => {
        if (editMode) return;
        navigate({
          to: "/$username/lists/$listSlug",
          params: { username: list.user_username, listSlug },
        });
      }}
      className="group bg-card relative flex h-full cursor-pointer items-start gap-3 rounded-lg border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <ListCoverCollage
        title={list.title}
        coverImageUrl={list.cover_image_url}
        coverSpeciesImages={list.cover_species_images}
        className="size-14 shrink-0 rounded-md"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-primary line-clamp-1 text-sm font-semibold group-hover:underline">
          {list.title}
        </h3>
        <div className="mt-0.5 min-h-8">
          {list.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs leading-4">
              {list.description}
            </p>
          )}
        </div>
        <span className="text-muted-foreground mt-1 block text-xs">
          {list.species_count} espécies
        </span>
      </div>
      {editMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full shadow-sm"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
};

type SortMode = "recent" | "popular";

export const ListsPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t("lists.title"));
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);
  const isAdmin = userDb?.username === ADMIN_USERNAME;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [viewMode, setViewMode] = useState<ListViewMode>(() =>
    isMobile ? "list" : "grid",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editFeatured, setEditFeatured] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerDebouncedSearch, setPickerDebouncedSearch] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pickerScrollRef = useRef<HTMLDivElement>(null);
  const pickerSentinelRef = useRef<HTMLDivElement>(null);
  const wasMobileRef = useRef(isMobile);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0 && trimmed.length < 3) return;
    const id = setTimeout(() => setDebouncedSearch(trimmed), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    const trimmed = pickerSearch.trim();
    if (trimmed.length > 0 && trimmed.length < 3) return;
    const id = setTimeout(() => setPickerDebouncedSearch(trimmed), 400);
    return () => clearTimeout(id);
  }, [pickerSearch]);

  useEffect(() => {
    if (!wasMobileRef.current && isMobile) {
      startTransition(() => {
        setViewMode("list");
      });
    }

    wasMobileRef.current = isMobile;
  }, [isMobile]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetPublicLists({
      sort: sortMode,
      search: debouncedSearch || undefined,
    });

  const {
    data: pickerData,
    fetchNextPage: pickerFetchNextPage,
    hasNextPage: pickerHasNextPage,
    isFetchingNextPage: pickerIsFetchingNextPage,
  } = useGetPublicLists({
    sort: "popular",
    search: pickerDebouncedSearch || undefined,
  });

  const { data: featuredLists = [], isLoading: featuredLoading } =
    useGetFeaturedLists();

  const { mutate: saveFeatured, isPending: savingFeatured } =
    useSetFeaturedLists();

  const allLists = useMemo(
    () => data?.pages.flatMap((p) => p.rows) ?? [],
    [data],
  );

  const featuredIds = useMemo(
    () => new Set(featuredLists.map((l) => l.id)),
    [featuredLists],
  );

  const pickerLists = useMemo(
    () =>
      (pickerData?.pages.flatMap((p) => p.rows) ?? []).filter(
        (l) => !featuredIds.has(l.id),
      ),
    [pickerData, featuredIds],
  );

  useEffect(() => {
    if (!hasNextPage || !sentinelRef.current || !scrollRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage)
          void fetchNextPage();
      },
      { root: scrollRef.current, rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (
      !pickerOpen ||
      !pickerHasNextPage ||
      !pickerSentinelRef.current ||
      !pickerScrollRef.current
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !pickerIsFetchingNextPage)
          void pickerFetchNextPage();
      },
      { root: pickerScrollRef.current, rootMargin: "100px" },
    );
    observer.observe(pickerSentinelRef.current);
    return () => observer.disconnect();
  }, [
    pickerOpen,
    pickerHasNextPage,
    pickerIsFetchingNextPage,
    pickerFetchNextPage,
  ]);

  const handleListCreated = (_listId: string, title: string) => {
    setCreateOpen(false);
    if (userDb?.username) {
      navigate({
        to: "/$username/lists/$listSlug",
        params: { username: userDb.username, listSlug: slugify(title) },
      });
    }
  };

  const handleRemoveFeatured = (listId: string) => {
    const next = featuredLists.filter((l) => l.id !== listId).map((l) => l.id);
    saveFeatured(next);
  };

  const handleAddFeatured = (list: ListWithCreator) => {
    if (featuredLists.length >= MAX_FEATURED) return;
    const next = [...featuredLists.map((l) => l.id), list.id];
    saveFeatured(next);
    setPickerOpen(false);
    setPickerSearch("");
  };

  const sectionTitleClass =
    "text-muted-foreground text-xs font-semibold tracking-widest uppercase";
  const featuredGridClass =
    "grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(20rem,1fr))]";
  const listGridClass =
    "grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))]";

  return (
    <div ref={scrollRef}>
      <div className="mx-auto flex max-w-7xl flex-col py-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3 py-4 text-center"
        >
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            {t("lists.tagline")}
          </p>
          <Button
            onClick={() =>
              isAuthenticated ? setCreateOpen(true) : navigate({ to: "/login" })
            }
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5"
          >
            <Plus className="size-3.5" />
            <span className="text-xs">{t("lists.create")}</span>
          </Button>
        </motion.div>

        {(featuredLists.length > 0 || featuredLoading || isAdmin) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="pb-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex-1">
                <span className={sectionTitleClass}>
                  {t("lists.featuredLists")}
                </span>
                <div className="bg-border mt-1.5 h-px w-full" />
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-3 h-7 gap-1.5 px-2 text-xs"
                  onClick={() => setEditFeatured((v) => !v)}
                  disabled={savingFeatured}
                >
                  {editFeatured ? (
                    t("lists.featuredDone")
                  ) : (
                    <>
                      <Pencil className="size-3" />
                      {t("lists.featuredEdit")}
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className={featuredGridClass}>
              {featuredLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted h-20 animate-pulse rounded-lg border"
                    />
                  ))
                : featuredLists.map((list, i) => (
                    <motion.div
                      key={list.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                      className="h-full"
                    >
                      <FeaturedListCard
                        list={list}
                        editMode={editFeatured}
                        onRemove={() => handleRemoveFeatured(list.id)}
                      />
                    </motion.div>
                  ))}

              {editFeatured && featuredLists.length < MAX_FEATURED && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setPickerOpen(true)}
                  className="border-border text-muted-foreground hover:bg-muted/50 flex h-20 items-center justify-center gap-2 rounded-lg border-2 border-dashed text-xs transition-colors"
                >
                  <Plus className="size-4" />
                  {t("lists.featuredAdd")}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        <div className="pb-2">
          <span className={sectionTitleClass}>{t("lists.allLists")}</span>
          <div className="bg-border mt-1.5 h-px w-full" />
        </div>

        <div className="flex items-center gap-2 py-2">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("lists.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 focus:bg-background focus:border-border h-8 w-full rounded-lg border border-transparent pl-8 text-sm transition-colors outline-none"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5"
                >
                  <ArrowUpDown className="size-3.5" />
                  <span className="hidden text-xs sm:inline">
                    {sortMode === "recent"
                      ? t("lists.newest")
                      : t("lists.popular")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortMode("recent")}>
                  {t("lists.newestFirst")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortMode("popular")}>
                  {t("lists.popularFirst")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ListViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="py-4">
              <div
                className={viewMode === "grid" ? listGridClass : "space-y-3"}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      viewMode === "grid"
                        ? "bg-muted h-72 animate-pulse rounded-lg border"
                        : "bg-muted flex h-22 animate-pulse items-center gap-4 rounded-xl border p-3"
                    }
                  />
                ))}
              </div>
            </div>
          ) : allLists.length === 0 && !isFetchingNextPage ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-muted-foreground text-center">
                <ListX className="mb-3 size-16 opacity-30" />
                <p className="mb-1 text-lg font-medium">
                  {t("lists.noListsFound")}
                </p>
                <p className="text-sm">{t("lists.adjustFilters")}</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div
                className={viewMode === "grid" ? listGridClass : "space-y-3"}
              >
                {allLists.map((list, i) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.25 }}
                    className={viewMode === "grid" ? "h-full" : undefined}
                  >
                    {viewMode === "grid" ? (
                      <ListCompactCard list={list} />
                    ) : (
                      <ListCard list={list} />
                    )}
                  </motion.div>
                ))}

                {hasNextPage && (
                  <div
                    ref={sentinelRef}
                    className={
                      viewMode === "grid"
                        ? "col-span-full flex items-center justify-center py-8"
                        : "flex items-center justify-center py-8"
                    }
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

        <ListCreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleListCreated}
        />

        <Dialog
          open={pickerOpen}
          onOpenChange={(open) => {
            setPickerOpen(open);
            if (!open) setPickerSearch("");
          }}
        >
          <DialogContent className="flex flex-col">
            <DialogHeader>
              <DialogTitle>{t("lists.featuredPickerTitle")}</DialogTitle>
            </DialogHeader>

            <div className="relative px-1">
              <Search className="text-muted-foreground absolute top-1/2 left-4 size-3.5 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t("lists.searchPlaceholder")}
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="bg-muted/50 focus:bg-background focus:border-border h-8 w-full rounded-lg border border-transparent pl-8 text-sm transition-colors outline-none"
              />
            </div>

            {pickerLists.length === 0 && !pickerIsFetchingNextPage ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <Plus className="text-muted-foreground/40 size-10" />
                <p className="text-muted-foreground text-sm font-medium">
                  {t("lists.featuredPickerEmpty")}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("lists.featuredPickerEmptyHint")}
                </p>
              </div>
            ) : (
              <div
                ref={pickerScrollRef}
                className="max-h-[60dvh] overflow-y-auto px-1 pb-2"
              >
                <div className="flex flex-col gap-1">
                  {pickerLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddFeatured(list)}
                      className="hover:bg-muted flex items-center gap-3 rounded-lg p-2 text-left transition-colors"
                    >
                      <ListCoverCollage
                        title={list.title}
                        coverImageUrl={list.cover_image_url}
                        coverSpeciesImages={list.cover_species_images}
                        className="size-10 shrink-0 rounded-md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">
                          {list.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          @{list.user_username} · {list.species_count}{" "}
                          {t("lists.species")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {pickerHasNextPage && (
                  <div
                    ref={pickerSentinelRef}
                    className="flex items-center justify-center py-4"
                  >
                    {pickerIsFetchingNextPage && (
                      <Loader2 className="text-muted-foreground size-5 animate-spin" />
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
