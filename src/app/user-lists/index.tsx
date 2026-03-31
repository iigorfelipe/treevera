import { useParams } from "@tanstack/react-router";
import { useGetPublicProfile } from "@/hooks/queries/useGetPublicProfile";
import { useGetUserLists } from "@/hooks/queries/useGetLists";
import { ListX, X } from "lucide-react";
import { ListPreviewCard } from "@/modules/lists/list-preview-card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Menu } from "@/modules/header/menu";
import { Button } from "@/common/components/ui/button";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { slugify } from "@/common/utils/slugify";

const PAGE_LIMIT = 50;

export const UserListsPage = () => {
  const { t } = useTranslation();
  const { username } = useParams({ strict: false }) as { username: string };
  const userDb = useAtomValue(authStore.userDb);
  const isOwner = userDb?.username === username;

  const { data: profile, isLoading: loadingProfile } =
    useGetPublicProfile(username);
  const { data: listsData, isLoading: loadingLists } = useGetUserLists(
    profile?.id,
    PAGE_LIMIT,
  );

  const lists = listsData?.rows ?? [];
  const title = isOwner ? t("lists.myLists") : t("lists.listsOf", { username });

  return (
    <div className="mx-auto flex h-screen max-w-7xl flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b"
      >
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="min-w-0 flex-1">
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

          <div className="flex shrink-0 items-center gap-1">
            <Menu />
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        {loadingLists ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted h-22 animate-pulse rounded-xl border"
              />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <ListX className="mx-auto mb-3 size-16 opacity-30" />
              <p className="text-sm">
                {isOwner
                  ? t("lists.emptyMyLists")
                  : t("lists.emptyListsOf", { username })}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {lists.map((list, i) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
              >
                <ListPreviewCard
                  list={{ ...list, slug: list.slug || slugify(list.title) }}
                  username={username}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
