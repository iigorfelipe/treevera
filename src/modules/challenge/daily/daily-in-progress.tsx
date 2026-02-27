import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import Alvo from "@/assets/alvo.gif";
import AlvoWhite from "@/assets/alvo-white.gif";
import { useTranslation } from "react-i18next";
import { TaxonomicPath } from "@/modules/challenge/components/taxonomic-path";
import { treeAtom } from "@/store/tree";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Timer } from "@/modules/challenge/components/timer";
import { useResponsive } from "@/hooks/use-responsive";
import { useNavigate } from "@tanstack/react-router";
import { ChallengeMobile } from "@/modules/challenge/mobile";
import { SpecieDetail } from "@/app/details/specie-detail";
import { useTheme } from "@/context/theme";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetParents } from "@/hooks/queries/useGetParents";
import { buildChallengePathFromParents } from "@/common/utils/game/challenge-path";
import { saveChallengeResult } from "@/common/utils/supabase/challenge/save-challenge-result";
import { addChallengeActivity } from "@/common/utils/supabase/add-challenge-activity";
import { authStore } from "@/store/auth/atoms";
import { ChallengeTips } from "@/modules/challenge/components/tips";
import { useGetDailyChallenge } from "@/hooks/queries/useGetDailyChallenge";
import { DailyDateNav } from "@/modules/challenge/daily/daily-date-nav";
import { getRandomChallengeForUser } from "@/common/utils/supabase/challenge/get-random-challenge";
import { ChallengeCompleted } from "@/modules/challenge/completed";

const getTodayUTC = () => new Date().toISOString().slice(0, 10);

export const DailyChallengeInProgress = () => {
  const { t } = useTranslation();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const navigate = useNavigate();
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);

  const { isTablet } = useResponsive();
  const { theme } = useTheme();
  const challenge = useAtomValue(treeAtom.challenge);
  const session = useAtomValue(authStore.session);
  const [userDb, setUserDb] = useAtom(authStore.userDb);

  const today = getTodayUTC();
  const speciesName = challenge.targetSpecies ?? "";
  const speciesKey = challenge.speciesKey ?? 0;
  const challengeDate = challenge.challengeDate ?? today;

  const [navDate, setNavDate] = useState(challengeDate);
  const { data: navChallengeData, isLoading: navLoading } =
    useGetDailyChallenge(navDate);
  const [randomLoading, setRandomLoading] = useState(false);

  const { data: specieDetail } = useGetSpecieDetail({ specieKey: speciesKey });
  const { data: parentsData } = useGetParents(speciesKey, !!speciesKey);

  const correctPath = useMemo(() => {
    if (!parentsData || !specieDetail) return [];
    return buildChallengePathFromParents(
      parentsData,
      specieDetail.canonicalName ?? specieDetail.species ?? "",
      speciesKey,
    );
  }, [parentsData, specieDetail, speciesKey]);

  const correctSteps = useMemo(() => {
    return expandedNodes.filter((node, index) => {
      const expected = correctPath[index];
      return expected && node.name === expected.name;
    }).length;
  }, [expandedNodes, correctPath]);

  const isCompleted =
    correctPath.length > 0 && correctSteps === correctPath.length;

  useEffect(() => {
    if (!isCompleted) return;

    setChallenge((prev) => {
      if (prev.status === "COMPLETED") return prev;
      return { ...prev, status: "COMPLETED" };
    });

    const userId = session?.user?.id;
    if (!userId || !speciesKey || !userDb) return;

    void (async () => {
      const { wasNew } = await saveChallengeResult({
        userId,
        gbifKey: speciesKey,
        mode: "DAILY",
      });
      if (wasNew) {
        const updatedUser = await addChallengeActivity({
          user: userDb,
          speciesName,
          mode: "DAILY",
        });
        if (updatedUser) setUserDb(updatedUser);
      }
    })();
  }, [
    isCompleted,
    setChallenge,
    session,
    speciesKey,
    userDb,
    speciesName,
    setUserDb,
  ]);

  const resetTree = () => {
    setExpandedNodes([]);
    void navigate({ to: "/", replace: true });
  };

  const handleCancel = () => {
    setChallenge({ status: "NOT_STARTED", mode: "UNSET" });
    resetTree();
  };

  const handleReplay = () => {
    resetTree();
    setChallenge((prev) => ({ ...prev, status: "IN_PROGRESS" }));
  };

  const handleRandom = async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setRandomLoading(true);
    const result = await getRandomChallengeForUser(userId);
    setRandomLoading(false);
    if (!result) return;
    resetTree();
    setChallenge({
      mode: "RANDOM",
      status: "IN_PROGRESS",
      targetSpecies: result.scientificName,
      speciesKey: result.gbifKey,
    });
  };

  const handlePlayNavDate = () => {
    if (!navChallengeData) return;
    resetTree();
    setChallenge({
      mode: "DAILY",
      status: "IN_PROGRESS",
      targetSpecies: navChallengeData.scientificName,
      speciesKey: navChallengeData.gbifKey,
      challengeDate: navDate,
    });
  };

  const lastStepWasError = useMemo(() => {
    const index = expandedNodes.length - 1;
    const node = expandedNodes[index];
    const expected = correctPath[index];
    return index >= 0 && expected && node?.name !== expected.name;
  }, [expandedNodes, correctPath]);

  const errorIndex = lastStepWasError ? expandedNodes.length - 1 : null;

  if (isCompleted) {
    const isNavSameAsPlayed = navDate === challengeDate;
    return (
      <div className="flex flex-col gap-4 pb-10">
        <ChallengeCompleted
          speciesName={speciesName}
          onReplay={handleReplay}
          onNext={handleRandom}
          nextLabel={t("challenge.nextRandom")}
          nextLoading={randomLoading}
        >
          <div className="flex w-full items-center justify-center gap-3">
            <DailyDateNav selectedDate={navDate} onSelectDate={setNavDate} />
            {!isNavSameAsPlayed && (
              <Button
                size="sm"
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
                onClick={handlePlayNavDate}
                disabled={navLoading || !navChallengeData}
              >
                {t("challenge.play")}
              </Button>
            )}
          </div>
        </ChallengeCompleted>

        <SpecieDetail embedded />
      </div>
    );
  }

  if (isTablet) {
    return (
      <ChallengeMobile
        speciesName={speciesName}
        speciesKey={speciesKey}
        correctSteps={correctSteps}
        isCompleted={isCompleted}
        onCancel={handleCancel}
        errorIndex={errorIndex}
        correctPath={correctPath}
      />
    );
  }

  return (
    <div className="mt-22 max-w-5xl md:mt-0 md:px-4 md:py-6">
      <Card className="relative rounded-3xl">
        {challengeDate === today && (
          <div className="absolute top-3 right-4">
            <Timer />
          </div>
        )}
        <CardContent className="flex flex-col gap-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
              <Image
                src={theme === "dark" ? AlvoWhite : Alvo}
                className="size-8"
                alt="Alvo gif"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                {t("challenge.title")}
              </p>
              <h2 className="truncate text-base leading-tight font-bold">
                {speciesName}
              </h2>
            </div>
          </div>

          {!isCompleted && correctPath.length > 0 && (
            <ChallengeTips
              speciesName={speciesName}
              speciesKey={speciesKey}
              currentStep={correctSteps}
              errorIndex={errorIndex}
              correctPath={correctPath}
            />
          )}
          <TaxonomicPath
            currentStep={correctSteps}
            correctPath={correctPath}
            activeIndex={expandedNodes.length}
          />

          {!isCompleted && (
            <div className="-mx-6 flex justify-end border-t px-8 pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive text-xs"
                onClick={handleCancel}
              >
                {t("challenge.cancel")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
