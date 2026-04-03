import { Button } from "@/common/components/ui/button";
import { List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useGetUserLists } from "@/hooks/queries/useGetLists";
import { ListPreviewCard } from "@/modules/lists/list-preview-card";
import { useNavigate } from "@tanstack/react-router";

const LIMIT = 2;

export const UserListsPreview = ({
  userId,
  username,
}: {
  userId?: string;
  username?: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userDb = useAtomValue(authStore.userDb);

  const targetUserId = userId ?? userDb?.id;
  const targetUsername = username ?? userDb?.username ?? "";
  const isOwner = !username || username === userDb?.username;
  const { data } = useGetUserLists(targetUserId, LIMIT + 1);

  const lists = (data?.rows ?? []).slice(0, LIMIT);
  const totalCount = data?.totalCount ?? 0;
  const shouldShowButton = totalCount > LIMIT;

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b">
        <h2 className="uppercase">{t("lists.myLists")}</h2>

        {shouldShowButton && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 px-2 text-xs"
            onClick={() =>
              navigate({
                to: "/$username/lists",
                params: { username: targetUsername },
              })
            }
          >
            {t("lists.viewAll")}
          </Button>
        )}
      </div>

      {lists.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          <List className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">
            {isOwner
              ? t("lists.emptyMyLists")
              : t("lists.emptyListsOf", { username: targetUsername })}
          </div>
          {isOwner && (
            <div className="text-xs">{t("lists.emptyMyListsHint")}</div>
          )}
        </div>
      ) : null}

      <div className="space-y-2">
        {lists.map((list) => (
          <ListPreviewCard
            key={list.id}
            list={list}
            username={targetUsername}
          />
        ))}
      </div>
    </div>
  );
};
