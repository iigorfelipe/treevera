import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import Alvo from "@/assets/alvo.gif";
import AlvoWhite from "@/assets/alvo-white.gif";
import { useTranslation } from "react-i18next";
import { TaxonomicPath } from "@/modules/challenge/components/taxonomic-path";

import { treeAtom } from "@/store/tree";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import {
  getDailySpecies,
  speciesPaths,
} from "@/common/utils/game/daily-species";
import { Timer } from "@/modules/challenge/components/timer";
import { AnimatePresence } from "framer-motion";
import { useResponsive } from "@/hooks/use-responsive";
import {
  ProgressSteps,
  TOTAL_STEPS,
} from "@/modules/challenge/components/progress-steps";
import { ChallengeMobile } from "@/modules/challenge/mobile";
import { ChallengeCompleted } from "@/modules/challenge/completed";
import { useTheme } from "@/context/theme";

export const RandomChallengeInProgress = () => {
  const { t } = useTranslation();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);

  const { isTablet } = useResponsive();
  const { theme } = useTheme();

  const speciesName = getDailySpecies();

  const correctPath = useMemo(
    () => speciesPaths[speciesName] ?? [],
    [speciesName],
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

      return {
        ...prev,
        status: "COMPLETED",
      };
    });
  }, [isCompleted, setChallenge]);

  const handleClick = () => {
    setChallenge({ status: "NOT_STARTED", mode: "UNSET" });
    setExpandedNodes([]);
  };

  const lastStepWasError = useMemo(() => {
    const index = expandedNodes.length - 1;
    const node = expandedNodes[index];
    const expected = correctPath[index];
    return index >= 0 && expected && node?.name !== expected.name;
  }, [expandedNodes, correctPath]);

  const errorIndex = lastStepWasError ? expandedNodes.length - 1 : null;

  if (isCompleted) {
    return <ChallengeCompleted />;
  }

  if (isTablet) {
    return (
      <ChallengeMobile
        speciesName={speciesName}
        correctSteps={correctSteps}
        isCompleted={isCompleted}
        onCancel={handleClick}
        errorIndex={errorIndex}
      />
    );
  }

  return (
    <div className="mt-22 md:mt-0 md:px-4 md:py-6">
      <Card className="mx-auto rounded-3xl">
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={theme === "dark" ? AlvoWhite : Alvo}
                className="size-12"
                alt="Alvo gif"
              />
              <div>
                <h2 className="text-xl font-bold">{t("challenge.title")}</h2>
                <p className="text-sm">
                  {t("challenge.find")}:{" "}
                  <span className="font-semibold text-emerald-600">
                    {speciesName}
                  </span>
                </p>
              </div>
            </div>
            <Timer />
          </div>

          <ProgressSteps correctSteps={correctSteps} errorIndex={errorIndex} />

          <AnimatePresence mode="wait">
            <TaxonomicPath activeIndex={expandedNodes.length} />
          </AnimatePresence>

          {!isCompleted && (
            <Button size="lg" className="bg-red-500" onClick={handleClick}>
              {t("challenge.cancel")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
