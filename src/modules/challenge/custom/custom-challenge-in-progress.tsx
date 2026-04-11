import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";
import Alvo from "@/assets/alvo.gif";
import AlvoWhite from "@/assets/alvo-white.gif";
import { useTranslation } from "react-i18next";
import { TaxonomicPath } from "@/modules/challenge/components/taxonomic-path";

import {
  treeAtom,
  setChallengeCorrectPathAtom,
  setHighlightedKeysAtom,
} from "@/store/tree";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useResponsive } from "@/hooks/use-responsive";
import { ChallengeMobile } from "@/modules/challenge/mobile";
import { useTheme } from "@/context/theme";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetParents } from "@/hooks/queries/useGetParents";
import { buildChallengePathFromParents } from "@/common/utils/game/challenge-path";
import { saveChallengeResult } from "@/common/utils/supabase/challenge/save-challenge-result";
import { ChallengeShareButton } from "@/modules/challenge/components/challenge-share-button";
import { toast } from "sonner";
import { AudioManager } from "@/lib/audio-manager";
import { addChallengeActivity } from "@/common/utils/supabase/add-challenge-activity";
import { authStore } from "@/store/auth/atoms";
import {
  ChallengeTips,
  type StepInteractionType,
} from "@/modules/challenge/components/tips";
import { ProgressSteps } from "@/modules/challenge/components/progress-steps";
import { useCheckAchievements } from "@/hooks/mutations/useCheckAchievements";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/hooks/queries/keys";

const getTodayUTC = () => new Date().toISOString().slice(0, 10);

export const CustomChallengeInProgress = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const queryClient = useQueryClient();
  const checkAchievements = useCheckAchievements();
  const setChallengeCorrectPath = useSetAtom(setChallengeCorrectPathAtom);
  const setHighlightedKeys = useSetAtom(setHighlightedKeysAtom);

  const { isTablet } = useResponsive();
  const { theme } = useTheme();
  const challenge = useAtomValue(treeAtom.challenge);
  const session = useAtomValue(authStore.session);

  const speciesName = challenge.targetSpecies ?? "";
  const speciesKey = challenge.speciesKey ?? 0;

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

  useEffect(() => {
    setChallengeCorrectPath(correctPath);
  }, [correctPath, setChallengeCorrectPath]);

  const correctSteps = useMemo(() => {
    let count = 0;
    for (let i = 0; i < expandedNodes.length; i++) {
      const expected = correctPath[i];
      if (
        expected &&
        expandedNodes[i].name.toLowerCase() === expected.name.toLowerCase()
      )
        count++;
      else break;
    }
    return count;
  }, [expandedNodes, correctPath]);

  const isCompleted =
    correctPath.length > 0 && correctSteps === correctPath.length;

  const errorTracking = challenge.errorTracking ?? {
    count: 0,
    perStep: [] as number[],
  };
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const prevLastKeyRef = useRef<number | undefined>(undefined);
  const prevCorrectStepsRef = useRef(0);
  const stepStartRef = useRef<number>(challenge.startedAt ?? 0);
  const stepTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (correctSteps > prevCorrectStepsRef.current) {
      const now = Date.now();
      stepTimesRef.current[correctSteps - 1] = Math.floor(
        (now - stepStartRef.current) / 1000,
      );
      stepStartRef.current = now;
      prevCorrectStepsRef.current = correctSteps;
    }
  }, [correctSteps]);

  useEffect(() => {
    if (finishedAt !== null) return;
    if (correctPath.length === 0 || expandedNodes.length === 0) return;
    const lastNode = expandedNodes[expandedNodes.length - 1];
    if (!lastNode || lastNode.key === prevLastKeyRef.current) return;
    prevLastKeyRef.current = lastNode.key;
    const lastIndex = expandedNodes.length - 1;
    const expected = correctPath[lastIndex];
    if (!expected) return;
    if (lastNode.name.toLowerCase() !== expected.name.toLowerCase()) {
      setChallenge((prev) => {
        const et = prev.errorTracking ?? { count: 0, perStep: [] };
        const perStep = [...et.perStep];
        perStep[lastIndex] = (perStep[lastIndex] ?? 0) + 1;
        return { ...prev, errorTracking: { count: et.count + 1, perStep } };
      });
    }
  }, [expandedNodes, correctPath, finishedAt, setChallenge]);

  useEffect(() => {
    if (!isCompleted || finishedAt !== null) return;

    AudioManager.play("win");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFinishedAt(Date.now());

    setChallenge((prev) => {
      if (prev.status === "COMPLETED") return prev;
      const elapsed = Math.floor((Date.now() - (prev.startedAt ?? 0)) / 1000);
      const et = prev.errorTracking ?? { count: 0, perStep: [] };
      const si = prev.stepInteractions ?? {};
      return {
        ...prev,
        status: "COMPLETED",
        completionData: {
          elapsedSeconds: elapsed,
          errorCount: et.count,
          totalSteps: correctPath.length,
          correctPath,
          stepErrors: et.perStep,
          stepInteractions: si,
          stepTimes: [...stepTimesRef.current],
        },
      };
    });

    const userId = session?.user?.id;
    if (!userId || !speciesKey) return;

    void (async () => {
      const { wasNew } = await saveChallengeResult({
        userId,
        gbifKey: speciesKey,
        mode: "CUSTOM",
        speciesName,
        challengeDate: getTodayUTC(),
        elapsedSeconds: Math.floor(
          (Date.now() - (challenge.startedAt ?? 0)) / 1000,
        ),
        errorCount: errorTracking.count,
        correctSteps: correctPath.length,
        totalSteps: correctPath.length,
      });
      if (wasNew) {
        await addChallengeActivity({ userId, speciesName, mode: "CUSTOM" });
        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.user_challenge_history_key, userId],
        });
        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.challenge_stats_key, userId],
        });
      }
      await checkAchievements();
    })();
  }, [isCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepInteraction = (step: number, type: StepInteractionType) => {
    setChallenge((prev) => ({
      ...prev,
      stepInteractions: {
        ...prev.stepInteractions,
        [step]: { ...prev.stepInteractions?.[step], [type]: true },
      },
    }));
  };

  const handleCancel = () => {
    setChallenge({ status: "NOT_STARTED", mode: "UNSET" });
    setExpandedNodes([]);
    setHighlightedKeys([]);
    void navigate({ to: "/challenges" });
  };

  const handleRestart = () => {
    setExpandedNodes([]);
    setHighlightedKeys([]);
    void navigate({ to: "/challenges/custom" });
    setChallenge((prev) => ({
      ...prev,
      status: "IN_PROGRESS",
      startedAt: Date.now(),
      errorTracking: { count: 0, perStep: [] },
      stepInteractions: {},
      replayId: (prev.replayId ?? 0) + 1,
    }));
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/treevera/challenges/custom?species=${speciesKey}&name=${encodeURIComponent(speciesName)}`;
    const text = t("challenge.shareText", { speciesName });
    if (navigator.share) {
      await navigator.share({ title: "Treevera", url, text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast(t("specieDetail.shareCopied"));
    }
  };

  const lastStepWasError = useMemo(() => {
    const index = expandedNodes.length - 1;
    const node = expandedNodes[index];
    const expected = correctPath[index];
    return (
      index >= 0 &&
      expected &&
      node?.name.toLowerCase() !== expected.name.toLowerCase()
    );
  }, [expandedNodes, correctPath]);

  const errorIndex = lastStepWasError ? expandedNodes.length - 1 : null;

  if (finishedAt !== null) return null;

  if (isTablet) {
    return (
      <ChallengeMobile
        speciesName={speciesName}
        speciesKey={speciesKey}
        correctSteps={correctSteps}
        isCompleted={isCompleted}
        onCancel={handleCancel}
        onRestart={handleRestart}
        onNext={handleCancel}
        nextLoading={false}
        onShare={handleShare}
        errorIndex={errorIndex}
        correctPath={correctPath}
        errorCount={errorTracking.count}
        onInteraction={handleStepInteraction}
      />
    );
  }

  return (
    <div className="mt-22 md:mt-0 md:px-4 md:py-6">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={speciesKey || "loading"}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Card className="mx-auto rounded-3xl">
            <CardContent className="flex flex-col gap-4 pt-5">
              <div className="flex items-center gap-3">
                <Image
                  src={theme === "dark" ? AlvoWhite : Alvo}
                  className="size-12 shrink-0"
                  alt="Alvo gif"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold">
                    {t("challenge.modeCustom")}
                  </h2>
                  <p className="truncate text-sm">
                    {t("challenge.find")}:{" "}
                    <span className="font-semibold">{speciesName}</span>
                  </p>
                </div>
              </div>

              {correctPath.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-1/3 rounded-lg" />
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <ProgressSteps
                    correctSteps={correctSteps}
                    errorIndex={errorIndex}
                    totalSteps={correctPath.length}
                  />
                  <ChallengeTips
                    speciesName={speciesName}
                    speciesKey={speciesKey}
                    currentStep={correctSteps}
                    errorIndex={errorIndex}
                    correctPath={correctPath}
                    onInteraction={handleStepInteraction}
                  />
                  <TaxonomicPath
                    correctPath={correctPath}
                    activeIndex={expandedNodes.length}
                    currentStep={correctSteps}
                  />
                </>
              )}

              <CardFooter className="-mx-6 flex flex-wrap items-center justify-between border-t px-8 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive text-xs"
                  onClick={handleCancel}
                >
                  {t("challenge.cancel")}
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground text-xs"
                    onClick={handleRestart}
                  >
                    <RotateCcw className="mr-1 size-3.5" />
                    {t("challenge.restart")}
                  </Button>
                  <ChallengeShareButton
                    speciesName={speciesName}
                    onShare={handleShare}
                  />
                </div>
              </CardFooter>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
