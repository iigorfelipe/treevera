import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, Plus, Loader2, ListX } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useGetPublicLists } from "@/hooks/queries/useGetLists";
import { slugify } from "@/common/utils/slugify";
import { ListCard } from "./list-card";
import { ListCreateDialog } from "./list-create-dialog";

type SortMode = "recent" | "popular";

export const ListsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [createOpen, setCreateOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0 && trimmed.length < 3) return;
    const id = setTimeout(() => setDebouncedSearch(trimmed), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetPublicLists({
      sort: sortMode,
      search: debouncedSearch || undefined,
    });

  const allLists = useMemo(
    () => data?.pages.flatMap((p) => p.rows) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.totalCount ?? 0;

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

  const handleListCreated = (_listId: string, title: string) => {
    setCreateOpen(false);
    if (userDb?.username) {
      navigate({
        to: "/$username/lists/$listSlug",
        params: { username: userDb.username, listSlug: slugify(title) },
      });
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b"
      >
        <div className="px-4 pt-4 pb-2">
          <div className="min-w-0">
            <h1 className="text-base leading-tight font-bold">
              {t("lists.title")}
            </h1>
            <span className="text-muted-foreground text-xs">
              {totalCount} {t("lists.title").toLowerCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-2">
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

            {isAuthenticated && (
              <Button
                onClick={() => setCreateOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-2.5"
              >
                <Plus className="size-3.5" />
                <span className="hidden text-xs sm:inline">
                  {t("lists.create")}
                </span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted flex h-22 animate-pulse items-center gap-4 rounded-xl border p-3"
              />
            ))}
          </div>
        ) : allLists.length === 0 && !isFetchingNextPage ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <ListX className="mb-3 size-16 opacity-30" />
              <p className="mb-1 text-lg font-medium">
                {t("lists.noListsFound")}
              </p>
              <p className="text-sm">{t("lists.adjustFilters")}</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-3">
              {allLists.map((list, i) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                >
                  <ListCard list={list} />
                </motion.div>
              ))}

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

      <ListCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleListCreated}
      />
    </div>
  );
};
