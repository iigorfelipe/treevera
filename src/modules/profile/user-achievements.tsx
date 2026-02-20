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
          <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
            Bloqueadas
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {userAchievements.locked.map((achievement) => (
              <div
                key={achievement.id}
                className="group bg-muted hover:bg-muted/80 size-28 cursor-pointer rounded-lg border p-3 transition-all duration-300"
              >
                <div className="flex size-full flex-col items-center justify-between text-center">
                  <div className="bg-muted-foreground/20 group-hover:bg-muted-foreground/30 relative flex size-7 items-center justify-center rounded-full transition-colors">
                    <achievement.icon className="text-muted-foreground size-4" />
                    <Lock className="bg-muted text-muted-foreground absolute -top-0.5 -right-0.5 size-3 rounded-full p-0.5" />
                  </div>
                  <div className="text-muted-foreground text-xs leading-tight font-semibold">
                    {achievement.name}
                  </div>
                  {achievement.progress >= 0 && (
                    <div className="w-full">
                      <Progress value={achievement.progress} className="h-1" />
                      <div className="text-muted-foreground mt-0.5 text-xs">
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
