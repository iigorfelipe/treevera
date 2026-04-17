import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useGetPublicProfile } from "@/hooks/queries/useGetPublicProfile";
import { useGetUserLikedLists } from "@/hooks/queries/useGetLists";
import { Heart } from "lucide-react";
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

const PAGE_LIMIT = 50;

export const UserLikedListsPage = () => {
  const { t } = useTranslation();
  const { username } = useParams({ strict: false }) as { username: string };
  const userDb = useAtomValue(authStore.userDb);
  const isOwner = userDb?.username === username;
  const [viewMode, setViewMode] = useState<ListViewMode>("grid");

  const { data: profile, isLoading: loadingProfile } =
    useGetPublicProfile(username);
  const { data: listsData, isLoading: loadingLists } = useGetUserLikedLists(
    profile?.id,
    PAGE_LIMIT,
  );

  const lists = listsData?.rows ?? [];
  const title = isOwner
    ? t("lists.myLikedLists")
    : t("lists.likedListsOf", { username });

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
                {lists.length > 0
                  ? `${lists.length} ${t("lists.title").toLowerCase()}`
                  : ""}
              </span>
            </div>

            <ListViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {loadingLists ? (
          <div className="p-4">
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
