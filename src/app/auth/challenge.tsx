import { Image } from "@/common/components/image";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { cn } from "@/common/utils/cn";
import Alvo from "@/assets/alvo.gif";
import { TaxonomicPath } from "@/modules/challenge/taxonomic-path";
import { authStore } from "@/store/auth";
import { treeAtom } from "@/store/tree";
import { useNavigate } from "@tanstack/react-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import {
  getDailySpecies,
  speciesPaths,
} from "@/common/utils/game/daily-species";
import { Timer } from "@/modules/challenge/timer";
import { AnimatePresence } from "framer-motion";
import { useResponsive } from "@/hooks/use-responsive";
import { ProgressSteps, TOTAL_STEPS } from "@/modules/challenge/progress-steps";
import { ChallengeMobile } from "@/modules/challenge/mobile";
import { Check } from "lucide-react";

export const DailyChallenge = () => {
  const [challenge, setChallenge] = useAtom(treeAtom.challenge);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const navigate = useNavigate();
  const { isTablet } = useResponsive();

  const speciesName = getDailySpecies();

  const correctPath = useMemo(
    () => speciesPaths[speciesName] ?? [],
    [speciesName],
  );

  const inProgress = challenge.status === "IN_PROGRESS";

  const correctSteps = useMemo(() => {
    return expandedNodes.filter((node, index) => {
      const expected = correctPath[index];
      return expected && node.name === expected.name;
    }).length;
  }, [expandedNodes, correctPath]);

  const isCompleted = correctSteps === TOTAL_STEPS;

  const handleClick = useCallback(() => {
    if (inProgress) {
      setChallenge({ status: "NOT_STARTED", mode: "UNSET" });
      setExpandedNodes([]);
      return;
    }

    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    setChallenge({ status: "IN_PROGRESS", mode: "DAILY" });
    setExpandedNodes([]);
  }, [inProgress, isAuthenticated, navigate, setChallenge, setExpandedNodes]);

  const lastStepWasError = useMemo(() => {
    const index = expandedNodes.length - 1;
    const node = expandedNodes[index];
    const expected = correctPath[index];
    return index >= 0 && expected && node?.name !== expected.name;
  }, [expandedNodes, correctPath]);

  const errorIndex = lastStepWasError ? expandedNodes.length - 1 : null;

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500">
          <Check className="size-4 text-white" />
        </div>
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          Desafio concluído!
        </p>
      </div>
    );
  }

  if (isTablet && inProgress) {
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
    <div className={cn("md:px-4 md:py-6", inProgress && "mt-22 md:mt-0")}>
      <Card className="mx-auto rounded-3xl">
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={Alvo} className="size-12" alt="Alvo gif" />
              <div>
                <h2 className="text-xl font-bold">Desafio Diário</h2>
                <p className="text-sm">
                  Encontre:{" "}
                  <span className="font-semibold text-emerald-600">
                    {speciesName}
                  </span>
                </p>
              </div>
            </div>
            <Timer />
          </div>

          {inProgress && (
            <ProgressSteps
              correctSteps={correctSteps}
              errorIndex={errorIndex}
            />
          )}

          <AnimatePresence mode="wait">
            {inProgress ? (
              <TaxonomicPath activeIndex={expandedNodes.length} />
            ) : (
              <div className="bg-accent/40 rounded-xl p-6 text-center">
                <p className="mb-2 text-lg font-semibold">Missão do dia</p>
                <p className="text-muted-foreground text-sm">
                  Complete o caminho taxonômico antes do tempo acabar.
                </p>
              </div>
            )}
          </AnimatePresence>

          {!isCompleted && (
            <Button
              size="lg"
              className={cn(inProgress ? "bg-red-500" : "bg-emerald-600")}
              onClick={handleClick}
            >
              {inProgress ? "Cancelar Desafio" : "Iniciar Desafio"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
