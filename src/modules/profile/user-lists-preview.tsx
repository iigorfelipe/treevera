import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { ChevronDown, ChevronUp, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useGetUserLists } from "@/hooks/queries/useGetLists";
import { ListPreviewCard } from "@/modules/lists/list-preview-card";

const DEFAULT_LIMIT = 2;
const EXPANDED_LIMIT = 10;

export const UserListsPreview = () => {
  const { t } = useTranslation();
  const userDb = useAtomValue(authStore.userDb);
  const [expanded, setExpanded] = useState(false);

  const limit = expanded ? EXPANDED_LIMIT : DEFAULT_LIMIT + 1;
  const { data } = useGetUserLists(userDb?.id, limit);

  const lists = data?.rows ?? [];
  const visibleLists = expanded ? lists : lists.slice(0, DEFAULT_LIMIT);
  const shouldShowButton = lists.length > DEFAULT_LIMIT;

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b">
        <h2>{t("lists.myLists")}</h2>

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
          <List className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">
            {t("lists.emptyMyLists")}
          </div>
          <div className="text-xs">{t("lists.emptyMyListsHint")}</div>
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
          <ListPreviewCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
};
