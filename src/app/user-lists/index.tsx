import { useParams, useNavigate } from "@tanstack/react-router";
import { useGetPublicProfile } from "@/hooks/queries/useGetPublicProfile";
import { useGetUserLists } from "@/hooks/queries/useGetLists";
import { ListX, X } from "lucide-react";
import { ListPreviewCard } from "@/modules/lists/list-preview-card";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Menu } from "@/modules/header/menu";
import { Button } from "@/common/components/ui/button";

const PAGE_LIMIT = 50;

export const UserListsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { username } = useParams({ strict: false }) as { username: string };
  const { data: profile, isLoading: loadingProfile } =
    useGetPublicProfile(username);
  const { data: listsData, isLoading: loadingLists } = useGetUserLists(
    profile?.id,
    PAGE_LIMIT,
  );

  const lists = listsData?.rows ?? [];

  return (
    <div className="flex h-screen flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-3 pb-2">
          <div className="min-w-0 flex-1">
            {loadingProfile ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-base leading-tight font-bold">
                  {t("lists.myLists")}
                </h1>
              </div>
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
              onClick={() =>
                navigate({ to: "/$username", params: { username } })
              }
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl flex-1 overflow-y-auto">
        {loadingLists ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground text-center">
              <ListX className="mx-auto mb-3 size-16 opacity-30" />
              <p className="text-sm">{t("lists.emptyMyLists")}</p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-2 p-4">
            {lists.map((list) => (
              <ListPreviewCard key={list.id} list={list} username={username} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
