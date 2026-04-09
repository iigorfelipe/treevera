import { Button } from "@/common/components/ui/button";
import { ChevronRight, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useGetUserLikedLists } from "@/hooks/queries/useGetLists";
import { ListCard } from "@/modules/lists/list-card";
import { useNavigate } from "@tanstack/react-router";

const DEFAULT_LIMIT = 3;

export const UserLikedListsPreview = ({
  userId,
  username,
}: {
  userId?: string;
  username?: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);

  const isOwner = !username || username === userDb?.username;
  const targetUserId = userId ?? userDb?.id;
  const targetUsername = username ?? userDb?.username;

  const { data } = useGetUserLikedLists(targetUserId, DEFAULT_LIMIT + 1);

  const lists = data?.rows ?? [];
  const visibleLists = lists.slice(0, DEFAULT_LIMIT);
  const hasMore = lists.length > DEFAULT_LIMIT;

  const handleViewAll = () => {
    if (targetUsername) {
      navigate({
        to: "/$username/liked-lists",
        params: { username: targetUsername },
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b">
        <h2>{t("lists.likedLists")}</h2>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 px-2 text-xs"
            onClick={handleViewAll}
          >
            {t("lists.viewAll")}
            <ChevronRight className="ml-1 size-3" />
          </Button>
        )}
      </div>

      {visibleLists.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          <Heart className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">
            {isOwner
              ? t("lists.emptyLikedLists")
              : t("lists.emptyLikedListsOf", { username })}
          </div>
          {isOwner && (
            <div className="text-xs">{t("lists.emptyLikedListsHint")}</div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
};
