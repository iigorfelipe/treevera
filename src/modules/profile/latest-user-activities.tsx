import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { formatActivityDate } from "@/common/utils/date-formats";
import { authStore } from "@/store/auth/atoms";

import { useAtomValue } from "jotai";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LatestUserActivities = () => {
  const { t } = useTranslation();
  const userDb = useAtomValue(authStore.userDb);

  const activities = userDb?.game_info?.activities ?? [];

  const [expanded, setExpanded] = useState(false);

  const DEFAULT_LIMIT = 4;

  const visibleActivities = expanded ? activities : activities.slice(0, 4);
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
            {expanded ? "Recolher" : "Expandir"}
            {expanded ? (
              <ChevronUp className="ml-1 size-3" />
            ) : (
              <ChevronDown className="ml-1 size-3" />
            )}
          </Button>
        )}
      </div>

      <div
        className={`space-y-2 ${
          expanded && activities.length > 4
            ? "max-h-100 overflow-y-auto pr-1"
            : ""
        }`}
      >
        {visibleActivities.map((activity, index) => (
          <div
            key={index}
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
              {formatActivityDate(activity.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
