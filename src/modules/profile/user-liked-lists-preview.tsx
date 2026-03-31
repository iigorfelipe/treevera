import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useGetUserLikedLists } from "@/hooks/queries/useGetLists";
import { ListPreviewCard } from "@/modules/lists/list-preview-card";

const DEFAULT_LIMIT = 2;
const EXPANDED_LIMIT = 10;

export const UserLikedListsPreview = ({ userId }: { userId?: string }) => {
  const { t } = useTranslation();
  const userDb = useAtomValue(authStore.userDb);
  const [expanded, setExpanded] = useState(false);

  const targetUserId = userId ?? userDb?.id;
  const limit = expanded ? EXPANDED_LIMIT : DEFAULT_LIMIT + 1;
  const { data } = useGetUserLikedLists(targetUserId, limit);

  const lists = data?.rows ?? [];
  const visibleLists = expanded ? lists : lists.slice(0, DEFAULT_LIMIT);
  const shouldShowButton = lists.length > DEFAULT_LIMIT;

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b">
        <h2>{t("lists.likedLists")}</h2>

        {shouldShowButton && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 px-2 text-xs"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? t("lists.collapse") : t("lists.expand")}
            {expanded ? (
              <ChevronUp className="ml-1 size-3" />
            ) : (
              <ChevronDown className="ml-1 size-3" />
            )}
          </Button>
        )}
      </div>

      {visibleLists.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          <Heart className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">
            {t("lists.emptyLikedLists")}
          </div>
          <div className="text-xs">{t("lists.emptyLikedListsHint")}</div>
        </div>
      ) : null}

      <div
        className={`space-y-2 ${
          expanded && lists.length > DEFAULT_LIMIT
            ? "max-h-100 overflow-y-auto pr-1"
            : ""
        }`}
      >
        {visibleLists.map((list) => (
          <ListPreviewCard key={list.id} list={list} username={list.user_username} />
        ))}
      </div>
    </div>
  );
};
