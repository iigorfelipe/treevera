import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { formatActivityDate } from "@/common/utils/date-formats";
import { ChevronDown, ChevronUp, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetUserActivities } from "@/hooks/queries/useGetUserActivities";

const DEFAULT_LIMIT = 4;
const EXPANDED_LIMIT = 50;

export const LatestUserActivities = ({ userId }: { userId?: string }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const { data: activities = [] } = useGetUserActivities(
    expanded ? EXPANDED_LIMIT : DEFAULT_LIMIT + 1,
    userId,
  );

  const visibleActivities = expanded
    ? activities
    : activities.slice(0, DEFAULT_LIMIT);
  const shouldShowButton = activities.length > DEFAULT_LIMIT;

  return (
    <div className="space-y-3">
      <div className="flex justify-between border-b">
        <h2>{t("activity.title")}</h2>

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

      {visibleActivities.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          <Activity className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <div className="mb-1 text-sm font-medium">
            {t("activity.emptyTitle")}
          </div>
          <div className="text-xs">{t("activity.emptyHint")}</div>
        </div>
      ) : null}

      <div
        className={`space-y-2 ${
          expanded && activities.length > DEFAULT_LIMIT
            ? "max-h-100 overflow-y-auto pr-1"
            : ""
        }`}
      >
        {visibleActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-2 border-b py-2 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">
                {activity.title}
              </div>
              <div className="text-muted-foreground text-xs">
                {activity.description}
              </div>
            </div>
            <div className="text-muted-foreground shrink-0 text-xs">
              {formatActivityDate(activity.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
