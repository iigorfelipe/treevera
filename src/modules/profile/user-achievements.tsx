import { Progress } from "@/common/components/ui/progress";
import { userAchievements } from "@/common/utils/data-profile-fake";
import { Lock } from "lucide-react";

export const UserAchievements = () => {
  return (
    <div className="space-y-3">
      <h2 className="border-b">CONQUISTAS</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {userAchievements.unlocked.map((achievement) => (
            <div
              key={achievement.id}
              className="group size-28 cursor-pointer rounded-lg border p-3 transition-all duration-300 hover:border-amber-200 hover:shadow-sm"
            >
              <div className="flex size-full flex-col items-center justify-around text-center">
                <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 transition-colors group-hover:bg-amber-200">
                  <achievement.icon className="size-5 text-amber-700" />
                </div>
                <div className="text-xs leading-tight font-semibold">
                  {achievement.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-500">
            Bloqueadas
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {userAchievements.locked.map((achievement) => (
              <div
                key={achievement.id}
                className="group size-28 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-700 dark:hover:bg-slate-500"
              >
                <div className="flex size-full flex-col items-center justify-between text-center">
                  <div className="relative flex size-7 items-center justify-center rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300 dark:bg-slate-400">
                    <achievement.icon className="size-4 text-slate-400 dark:text-slate-600" />
                    <Lock className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-slate-50 p-0.5 text-slate-500 dark:bg-slate-700 dark:text-slate-400" />
                  </div>
                  <div className="text-xs leading-tight font-semibold text-slate-600 dark:text-slate-400">
                    {achievement.name}
                  </div>
                  {achievement.progress >= 0 && (
                    <div className="w-full">
                      <Progress value={achievement.progress} className="h-1" />
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {achievement.progress}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
