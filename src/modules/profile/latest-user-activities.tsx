import { formatActivityDate } from "@/common/utils/date-formats";
import { authStore } from "@/store/auth/atoms";

import { useAtomValue } from "jotai";

export const LatestUserActivities = () => {
  const userDb = useAtomValue(authStore.userDb);

  return (
    <div className="space-y-3">
      <h2 className="border-b">ATIVIDADE</h2>

      <div className="space-y-2">
        {userDb?.game_info?.activities?.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-slate-900 dark:text-slate-200">
                {activity.title}
              </div>
              <div className="text-xs text-slate-500">
                {activity.description}
              </div>
            </div>
            <div className="shrink-0 text-xs text-slate-400">
              {formatActivityDate(activity.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
