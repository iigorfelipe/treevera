import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import Alvo from "@/assets/alvo.gif";
import AlvoWhite from "@/assets/alvo-white.gif";
import { Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TaxonomicPath } from "@/modules/challenge/components/taxonomic-path";

import { treeAtom } from "@/store/tree";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { getRandomChallengeForUser } from "@/common/utils/supabase/challenge/get-random-challenge";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useResponsive } from "@/hooks/use-responsive";
import { TOTAL_STEPS } from "@/modules/challenge/components/progress-steps";
import { ChallengeMobile } from "@/modules/challenge/mobile";
import { ChallengeCompleted } from "@/modules/challenge/completed";
import { SpecieDetail } from "@/app/details/specie-detail";
import { useTheme } from "@/context/theme";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { buildChallengePathFromDetail } from "@/common/utils/game/challenge-path";
import { saveChallengeResult } from "@/common/utils/supabase/challenge/save-challenge-result";
import { addChallengeActivity } from "@/common/utils/supabase/add-challenge-activity";
import { authStore } from "@/store/auth/atoms";
import { ChallengeTips } from "@/modules/challenge/components/tips";

export const RandomChallengeInProgress = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);

  const { isTablet } = useResponsive();
  const { theme } = useTheme();
  const challenge = useAtomValue(treeAtom.challenge);
  const session = useAtomValue(authStore.session);
  const [userDb, setUserDb] = useAtom(authStore.userDb);

  const speciesName = challenge.targetSpecies ?? "";
  const speciesKey = challenge.speciesKey ?? 0;

  const { data: specieDetail } = useGetSpecieDetail({ specieKey: speciesKey });

  const correctPath = useMemo(
    () => (specieDetail ? buildChallengePathFromDetail(specieDetail) : []),
    [specieDetail],
  );

  const correctSteps = useMemo(() => {
    return expandedNodes.filter((node, index) => {
      const expected = correctPath[index];
      return expected && node.name === expected.name;
    }).length;
  }, [expandedNodes, correctPath]);

  const isCompleted = correctSteps === TOTAL_STEPS;

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
        mode: "RANDOM",
      });
      if (wasNew) {
        const updatedUser = await addChallengeActivity({
          user: userDb,
          speciesName,
          mode: "RANDOM",
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

  const [nextLoading, setNextLoading] = useState(false);

  const resetTree = () => {
    setExpandedNodes([]);
    void navigate({ to: "/", replace: true });
  };

  const handleClick = () => {
    setChallenge({ status: "NOT_STARTED", mode: "UNSET" });
    resetTree();
  };

  const handleReplay = () => {
    resetTree();
    setChallenge((prev) => ({ ...prev, status: "IN_PROGRESS" }));
  };

  const handleNext = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    setNextLoading(true);
    const result = await getRandomChallengeForUser(userId);
    setNextLoading(false);

    if (!result) return;

    resetTree();
    setChallenge({
      mode: "RANDOM",
      status: "IN_PROGRESS",
      targetSpecies: result.scientificName,
      speciesKey: result.gbifKey,
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
    return (
      <div className="flex flex-col gap-4 pb-10">
        <ChallengeCompleted
          speciesName={speciesName}
          onReplay={handleReplay}
          onNext={handleNext}
          nextLabel={t("challenge.nextChallenge")}
          nextLoading={nextLoading}
        />
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
        onCancel={handleClick}
        onNext={handleNext}
        nextLoading={nextLoading}
        errorIndex={errorIndex}
        correctPath={correctPath}
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
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40">
                  <Image
                    src={theme === "dark" ? AlvoWhite : Alvo}
                    className="size-8"
                    alt="Alvo gif"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                    {t("challenge.randomTitle")}
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
                correctPath={correctPath}
                activeIndex={expandedNodes.length}
                currentStep={correctSteps}
              />

              {!isCompleted && (
                <div className="ml-auto flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive text-xs"
                    onClick={handleClick}
                  >
                    {t("challenge.cancel")}
                  </Button>
                  <Button
                    className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
                    onClick={handleNext}
                    disabled={nextLoading}
                  >
                    <Shuffle className="size-4" />
                    {t("challenge.nextChallenge")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
