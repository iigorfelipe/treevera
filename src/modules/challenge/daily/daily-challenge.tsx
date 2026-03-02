import { useState } from "react";
import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import Alvo from "@/assets/alvo.gif";
import AlvoWhite from "@/assets/alvo-white.gif";
import { useTranslation } from "react-i18next";
import { Timer } from "@/modules/challenge/components/timer";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { authStore } from "@/store/auth/atoms";
import { useTheme } from "@/context/theme";
import { treeAtom } from "@/store/tree";
import { useGetDailyChallenge } from "@/hooks/queries/useGetDailyChallenge";
import { useGetChallengeDates } from "@/hooks/queries/useGetChallengeDates";
import { DailyDateNav } from "@/modules/challenge/daily/daily-date-nav";
import { CheckCircle2 } from "lucide-react";

const getToday = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const DailyChallengeCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const challenge = useAtomValue(treeAtom.challenge);
  const setChallenge = useSetAtom(treeAtom.challenge);

  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(
    () => challenge.challengeDate ?? today,
  );

  const { data: challengeDates = [] } = useGetChallengeDates();
  const { data, isLoading, isError } = useGetDailyChallenge(selectedDate);

  const currentChallengeDate = challengeDates.find(
    (cd) => cd.date === selectedDate,
  );
  const isCompleted = currentChallengeDate?.completed ?? false;
  const isToday = selectedDate === today;

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleStart = () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (!data) return;
    setChallenge({
      mode: "DAILY",
      status: "IN_PROGRESS",
      targetSpecies: data.scientificName,
      speciesKey: data.gbifKey,
      challengeDate: selectedDate,
    });
  };

  const speciesName = data?.scientificName;

  return (
    <Card className="relative max-w-3xl rounded-3xl">
      {isToday && (
        <div className="absolute top-3 right-4">
          <Timer />
        </div>
      )}
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image
            src={theme === "dark" ? AlvoWhite : Alvo}
            className="size-12 shrink-0"
            alt="Alvo gif"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">{t("challenge.title")}</h2>
            <p className="text-sm">
              {t("challenge.find")}:{" "}
              {isLoading ? (
                <span className="text-muted-foreground animate-pulse font-semibold">
                  ...
                </span>
              ) : isError || !speciesName ? (
                <span className="text-muted-foreground font-semibold">—</span>
              ) : (
                <span className="font-semibold text-emerald-600">
                  {speciesName}
                </span>
              )}
            </p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          {t("challenge.missionDescription")}
        </p>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <DailyDateNav
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              {t("challenge.alreadyCompleted")}
            </span>
          )}
        </div>

        <Button
          size="lg"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={handleStart}
          disabled={isLoading || isError || !data}
        >
          {isCompleted ? t("challenge.play") : t("challenge.start")}
        </Button>
      </CardContent>
    </Card>
  );
};
