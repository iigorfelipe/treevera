import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useGetPublicProfile } from "@/hooks/queries/useGetPublicProfile";
import { useGetUserLikedListsInfinite } from "@/hooks/queries/useGetLists";
import { Heart, Loader2 } from "lucide-react";
import { ListCard } from "@/modules/lists/list-card";
import { ListCompactCard } from "@/modules/lists/list-compact-card";
import {
  ListViewToggle,
  type ListViewMode,
} from "@/modules/lists/list-view-toggle";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";

export const UserLikedListsPage = () => {
  const { t } = useTranslation();
  const { username } = useParams({ strict: false }) as { username: string };
  const userDb = useAtomValue(authStore.userDb);
  const isOwner = userDb?.username === username;
  const [viewMode, setViewMode] = useState<ListViewMode>("grid");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: profile, isLoading: loadingProfile } =
    useGetPublicProfile(username);
  const {
    data: listsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingLists,
  } = useGetUserLikedListsInfinite(profile?.id);

  const lists = useMemo(
    () => listsData?.pages.flatMap((page) => page.rows) ?? [],
    [listsData],
  );
  const totalCount = listsData?.pages[0]?.totalCount ?? lists.length;
  const title = isOwner
    ? t("lists.myLikedLists")
    : t("lists.likedListsOf", { username });
  const isInitialLoading = loadingProfile || loadingLists;

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

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b"
      >
        <div className="py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {loadingProfile ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <h1 className="text-base leading-tight font-bold">{title}</h1>
              )}
              <span className="text-muted-foreground text-xs">
                {totalCount > 0
                  ? `${totalCount} ${t("lists.title").toLowerCase()}`
                  : ""}
              </span>
            </div>

            <ListViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </motion.div>

      <div className="flex-1">
        {isInitialLoading ? (
          <div className="p-4">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-3"
              }
            >
              {Array.from({ length: viewMode === "grid" ? 8 : 4 }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={
                      viewMode === "grid"
                        ? "bg-muted h-64 animate-pulse rounded-lg border"
                        : "bg-muted h-22 animate-pulse rounded-xl border"
                    }
                  />
                ),
              )}
            </div>
          </div>
        ) : lists.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <Heart className="mx-auto mb-3 size-16 opacity-30" />
              <p className="text-sm">
                {isOwner
                  ? t("lists.emptyLikedLists")
                  : t("lists.emptyLikedListsOf", { username })}
              </p>
              {isOwner && (
                <p className="mt-1 text-xs">{t("lists.emptyLikedListsHint")}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-3"
              }
            >
              {lists.map((list, i) => (
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
    </div>
  );
};
