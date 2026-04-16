import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";
import { treeAtom, setHighlightedKeysAtom } from "@/store/tree";
import { authStore } from "@/store/auth/atoms";
import { ChallengeCompleted } from "@/modules/challenge/completed";
import { DailyDateNav } from "@/modules/challenge/daily/daily-date-nav";
import { getRandomChallengeForUser } from "@/common/utils/supabase/challenge/get-random-challenge";
import { getSectionPathname } from "@/common/utils/router-path";
import { useGetDailyChallenge } from "@/hooks/queries/useGetDailyChallenge";
import { useLocation, useNavigate } from "@tanstack/react-router";

const getToday = () => new Date().toISOString().slice(0, 10);

export const ChallengeCompletedOverlay = ({
  inline = false,
}: {
  inline?: boolean;
}) => {
  const { t } = useTranslation();
  const challenge = useAtomValue(treeAtom.challenge);
  const setChallenge = useSetAtom(treeAtom.challenge);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const setHighlightedKeys = useSetAtom(setHighlightedKeysAtom);
  const session = useAtomValue(authStore.session);

  const { completionData, targetSpecies, mode, challengeDate } = challenge;

  const location = useLocation();
  const navigate = useNavigate();

  const [nextLoading, setNextLoading] = useState(false);
  const [navDate, setNavDate] = useState(challengeDate ?? getToday());

  const { data: navDayData } = useGetDailyChallenge(
    mode === "DAILY" ? navDate : undefined,
  );

  const handleClose = () => {
    const parts = getSectionPathname(location.pathname, "challenges")
      .split("/")
      .filter(Boolean);
    const keys = parts.slice(2);
    const treePath = keys.length > 0 ? `/tree/${keys.join("/")}` : "/tree";
    setChallenge({ mode: null, status: "NOT_STARTED" });
    setHighlightedKeys([]);
    navigate({ to: treePath, resetScroll: false });
  };

  const handleReplay = () => {
    setExpandedNodes([]);
    setHighlightedKeys([]);
    const replayPath =
      mode === "DAILY"
        ? "/challenges/daily"
        : mode === "RANDOM"
          ? "/challenges/random"
          : "/challenges";
    void navigate({ to: replayPath, resetScroll: false });
    setChallenge((prev) => ({
      ...prev,
      status: "IN_PROGRESS",
      completionData: undefined,
      replayId: (prev.replayId ?? 0) + 1,
      startedAt: Date.now(),
      errorTracking: { count: 0, perStep: [] },
      stepInteractions: {},
    }));
  };

  const handleNext = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setNextLoading(true);
    const result = await getRandomChallengeForUser(userId);
    setNextLoading(false);

    if (!result) return;

    setExpandedNodes([]);
    setHighlightedKeys([]);
    void navigate({ to: "/challenges/random", resetScroll: false });
    setChallenge({
      mode: "RANDOM",
      status: "IN_PROGRESS",
      targetSpecies: result.scientificName,
      speciesKey: result.gbifKey,
      startedAt: Date.now(),
      errorTracking: { count: 0, perStep: [] },
      stepInteractions: {},
    });
  };

  const handlePlayNavDate = () => {
    if (!navDayData) return;
    setExpandedNodes([]);
    setHighlightedKeys([]);
    void navigate({ to: "/challenges/daily", resetScroll: false });
    setChallenge({
      mode: "DAILY",
      status: "IN_PROGRESS",
      targetSpecies: navDayData.scientificName,
      speciesKey: navDayData.gbifKey,
      challengeDate: navDate,
      startedAt: Date.now(),
      errorTracking: { count: 0, perStep: [] },
      stepInteractions: {},
    });
  };

  if (!completionData) return null;

  const nextLabel =
    mode === "DAILY" ? t("challenge.tryRandom") : t("challenge.nextChallenge");

  const { speciesKey } = challenge;
  const shareUrl =
    mode && speciesKey && targetSpecies
      ? `/challenges/${mode.toLowerCase()}?species=${speciesKey}&name=${encodeURIComponent(targetSpecies)}`
      : undefined;

  if (inline) {
    return (
      <ChallengeCompleted
        speciesName={targetSpecies ?? ""}
        onReplay={handleReplay}
        onNext={handleNext}
        onClose={handleClose}
        nextLabel={nextLabel}
        nextLoading={nextLoading}
        elapsedSeconds={completionData.elapsedSeconds}
        errorCount={completionData.errorCount}
        totalSteps={completionData.totalSteps}
        correctPath={completionData.correctPath}
        stepErrors={completionData.stepErrors}
        stepInteractions={completionData.stepInteractions}
        stepTimes={completionData.stepTimes}
        shareUrl={shareUrl}
      >
        {mode === "DAILY" && (
          <div className="flex flex-col items-center gap-3">
            <DailyDateNav selectedDate={navDate} onSelectDate={setNavDate} />
            <button
              className="text-sm font-medium text-emerald-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400"
              disabled={!navDayData || navDate === challengeDate}
              onClick={handlePlayNavDate}
            >
              {t("challenge.playThisDay")}
            </button>
          </div>
        )}
      </ChallengeCompleted>
    );
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-auto p-4">
      <ChallengeCompleted
        speciesName={targetSpecies ?? ""}
        onReplay={handleReplay}
        onNext={handleNext}
        onClose={handleClose}
        nextLabel={nextLabel}
        nextLoading={nextLoading}
        elapsedSeconds={completionData.elapsedSeconds}
        errorCount={completionData.errorCount}
        totalSteps={completionData.totalSteps}
        correctPath={completionData.correctPath}
        stepErrors={completionData.stepErrors}
        stepInteractions={completionData.stepInteractions}
        stepTimes={completionData.stepTimes}
        shareUrl={shareUrl}
      >
        {mode === "DAILY" && (
          <div className="flex flex-col items-center gap-3">
            <DailyDateNav selectedDate={navDate} onSelectDate={setNavDate} />
            <button
              className="text-sm font-medium text-emerald-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400"
              disabled={!navDayData || navDate === challengeDate}
              onClick={handlePlayNavDate}
            >
              {t("challenge.playThisDay")}
            </button>
          </div>
        )}
      </ChallengeCompleted>
    </div>
  );
};
