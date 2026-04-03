import { Progress } from "@/common/components/ui/progress";
import {
  ACHIEVEMENTS,
  getAchievementDescription,
  getAchievementName,
} from "@/common/data/achievements";
import {
  useGetUserAchievements,
  useGetAchievementProgress,
} from "@/hooks/queries/useGetUserAchievements";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Lock } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function formatUnlockDate(isoDate: string, locale?: string): string {
  return new Date(isoDate).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const UserAchievements = ({
  userId,
  isOwner = true,
}: {
  userId?: string;
  isOwner?: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const { data: unlockedRows = [], isLoading: isLoadingAchievements } =
    useGetUserAchievements(userId);
  const { data: progressRows = [], isLoading: isLoadingProgress } =
    useGetAchievementProgress(userId);

  const isLoading = isLoadingAchievements || isLoadingProgress;

  const progressMap = useMemo(
    () => new Map(progressRows.map((r) => [r.id, Math.round(r.progress)])),
    [progressRows],
  );

  const unlockedIds = useMemo(
    () => new Set(unlockedRows.map((r) => r.achievement_id)),
    [unlockedRows],
  );

  const unlocked = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id))
        .map((a) => ({
          ...a,
          name: getAchievementName(t, a.id),
          description: getAchievementDescription(t, a.id),
          isUnlocked: true as const,
          unlocked_at:
            unlockedRows.find((r) => r.achievement_id === a.id)?.unlocked_at ??
            null,
        }))
        .sort((a, b) => {
          if (!a.unlocked_at) return 1;
          if (!b.unlocked_at) return -1;
          return (
            new Date(a.unlocked_at).getTime() -
            new Date(b.unlocked_at).getTime()
          );
        }),
    [t, unlockedIds, unlockedRows],
  );

  const locked = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id))
        .map((a) => ({
          ...a,
          name: getAchievementName(t, a.id),
          description: getAchievementDescription(t, a.id),
          isUnlocked: false as const,
          progress: progressMap.get(a.id) ?? 0,
        }))
        .sort((a, b) => b.progress - a.progress),
    [t, unlockedIds, progressMap],
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="border-b">{t("achievements.title")}</h2>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="border-b">{t("achievements.title")}</h2>

      <div className="divide-y">
        {unlocked.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="flex items-center gap-3 py-3">
              <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-primary size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight font-semibold">{a.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                  {a.description}
                </p>
              </div>
              <p className="text-muted-foreground shrink-0 text-right text-xs">
                {a.unlocked_at
                  ? formatUnlockDate(
                      a.unlocked_at,
                      i18n.resolvedLanguage ?? i18n.language,
                    )
                  : ""}
              </p>
            </div>
          );
        })}

        {isOwner &&
          locked.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <div className="bg-muted-foreground/15 relative flex size-9 shrink-0 items-center justify-center rounded-full">
                  <Icon className="text-muted-foreground/50 size-4" />
                  <Lock className="bg-background text-muted-foreground absolute -right-0.5 -bottom-0.5 size-3 rounded-full p-0.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-sm leading-tight font-semibold">
                    {a.name}
                  </p>
                  <p className="text-muted-foreground/70 mt-0.5 text-xs leading-snug">
                    {a.description}
                  </p>
                </div>
                <div className="w-16 shrink-0 space-y-1">
                  <Progress value={a.progress} className="h-1" />
                  <p className="text-muted-foreground text-right text-xs">
                    {a.progress}%
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
