import { Progress } from "@/common/components/ui/progress";
import { ACHIEVEMENTS, KNOWN_KINGDOMS } from "@/common/data/achievements";
import { useGetUserAchievements } from "@/hooks/queries/useGetUserAchievements";
import { useGetUserSeenSpecies } from "@/hooks/queries/useGetUserSeenSpecies";
import { useGetUserChallengeHistory } from "@/hooks/queries/useGetUserChallengeHistory";
import type { UserSeenSpeciesRow } from "@/common/utils/supabase/user-seen-species";
import type { UserChallengeHistoryRow } from "@/common/utils/supabase/user-challenge-history";
import { Skeleton } from "@/common/components/ui/skeleton";
import { authStore } from "@/store/auth/atoms";
import { Lock } from "lucide-react";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function computeMaxStreak(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  let max = 0,
    curr = 0;
  let prev: string | null = null;
  for (const date of sorted) {
    if (prev) {
      const diff =
        (new Date(date).getTime() - new Date(prev).getTime()) /
        (1000 * 60 * 60 * 24);
      curr = diff === 1 ? curr + 1 : 1;
    } else {
      curr = 1;
    }
    max = Math.max(max, curr);
    prev = date;
  }
  return max;
}

function computeProgress(
  achievementId: string,
  seenSpecies: UserSeenSpeciesRow[],
  challenges: UserChallengeHistoryRow[],
  topFavCount: number,
): number {
  switch (achievementId) {
    case "primeira_descoberta":
      return Math.min(seenSpecies.length, 1) * 100;
    case "explorador_da_vida":
      return Math.min((seenSpecies.length / 100) * 100, 100);
    case "equilibrio_da_vida": {
      const kingdoms = new Set(
        seenSpecies.map((s) => s.kingdom).filter(Boolean),
      ).size;
      return Math.min((kingdoms / KNOWN_KINGDOMS.length) * 100, 100);
    }
    case "defensor_biodiversidade": {
      const count = seenSpecies.filter((s) =>
        ["EN", "VU"].includes(s.iucn_status ?? ""),
      ).length;
      return Math.min((count / 5) * 100, 100);
    }
    case "na_linha_vermelha": {
      const count = seenSpecies.filter((s) => s.iucn_status === "CR").length;
      return Math.min((count / 5) * 100, 100);
    }
    case "habito_selvagem": {
      const dates = seenSpecies.map((s) => s.seen_at.slice(0, 10));
      return Math.min((computeMaxStreak(dates) / 7) * 100, 100);
    }
    case "curador_da_vida": {
      const count = seenSpecies.filter((s) => s.is_favorite).length;
      return Math.min((count / 25) * 100, 100);
    }
    case "primeiro_desafio_diario": {
      const count = challenges.filter((c) => c.mode === "DAILY").length;
      return Math.min(count, 1) * 100;
    }
    case "sem_roteiro": {
      const count = challenges.filter((c) => c.mode === "RANDOM").length;
      return Math.min((count / 5) * 100, 100);
    }
    case "semana_perfeita": {
      const dailyDates = challenges
        .filter((c) => c.mode === "DAILY")
        .map((c) => c.challenge_date);
      return Math.min((computeMaxStreak(dailyDates) / 7) * 100, 100);
    }
    case "incansavel":
      return Math.min((challenges.length / 50) * 100, 100);
    case "vitrine_pessoal":
      return Math.min((topFavCount / 4) * 100, 100);
    default:
      return 0;
  }
}

function formatUnlockDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const UserAchievements = () => {
  const { t } = useTranslation();
  const userDb = useAtomValue(authStore.userDb);
  const topFavCount = userDb?.game_info.top_fav_species?.length ?? 0;
  const { data: unlockedRows = [], isLoading: isLoadingAchievements } =
    useGetUserAchievements();
  const { data: seenSpecies = [], isLoading: isLoadingSpecies } =
    useGetUserSeenSpecies();
  const { data: challenges = [], isLoading: isLoadingChallenges } =
    useGetUserChallengeHistory();

  const isLoading =
    isLoadingAchievements || isLoadingSpecies || isLoadingChallenges;

  const unlockedIds = useMemo(
    () => new Set(unlockedRows.map((r) => r.achievement_id)),
    [unlockedRows],
  );

  const unlocked = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id))
        .map((a) => ({
          ...a,
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
    [unlockedIds, unlockedRows],
  );

  const locked = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id))
        .map((a) => ({
          ...a,
          isUnlocked: false as const,
          progress: Math.round(
            computeProgress(a.id, seenSpecies, challenges, topFavCount),
          ),
        }))
        .sort((a, b) => b.progress - a.progress),
    [unlockedIds, seenSpecies, challenges, topFavCount],
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
                {a.unlocked_at ? formatUnlockDate(a.unlocked_at) : ""}
              </p>
            </div>
          );
        })}

        {locked.map((a) => {
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
