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
import { motion, AnimatePresence } from "framer-motion";
import { useResponsive } from "@/hooks/use-responsive";

export const DailyChallenge = () => {
  const [challenge, setChallenge] = useAtom(treeAtom.challenge);
  const expandedNodes = useAtomValue(treeAtom.expandedNodes);
  const setExpandedNodes = useSetAtom(treeAtom.expandedNodes);
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const navigate = useNavigate();
  const { isTablet } = useResponsive();

  const speciesName = getDailySpecies();

  const correctPath = useMemo(
    () => speciesPaths[speciesName] || [],
    [speciesName],
  );

  const inProgress = useMemo(
    () => challenge.status === "IN_PROGRESS",
    [challenge.status],
  );

  const correctSteps = useMemo(() => {
    return expandedNodes.filter((node, index) => {
      const expected = correctPath[index];
      return expected && node.name === expected.name;
    }).length;
  }, [expandedNodes, correctPath]);

  const progress = (correctSteps / 7) * 100;
  const isCompleted = correctSteps === 7;

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
    if (index < 0) return false;

    const node = expandedNodes[index];
    const expected = correctPath[index];

    return !!node && !!expected && node.name !== expected.name;
  }, [expandedNodes, correctPath]);

  return (
    <div className={cn("md:px-4 md:py-6", inProgress && "mt-22 md:mt-0")}>
      <Card className="mx-auto rounded-3xl border bg-transparent shadow-sm">
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={Alvo} className="size-12" alt="Alvo gif" />
              <div>
                <h2 className="text-xl font-bold 2xl:text-2xl">
                  Desafio Diário
                </h2>
                <p className="text-sm">
                  Encontre:{" "}
                  <span className="font-semibold text-emerald-600 dark:text-green-500">
                    {speciesName}
                  </span>
                </p>
              </div>
            </div>

            <Timer />
          </div>

          {inProgress && (
            <div className="space-y-1">
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  key={`${expandedNodes.length}-${lastStepWasError ? "error" : "ok"}`}
                  className={cn(
                    "h-full rounded-full",
                    lastStepWasError ? "bg-red-500" : "bg-emerald-500",
                  )}
                  initial={{ width: `${progress}%` }}
                  animate={{
                    width: `${progress}%`,
                    x: lastStepWasError ? [-4, 4, -2, 2, 0] : 0,
                    opacity: lastStepWasError ? [1, 0.6, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.p
                key={`steps-${expandedNodes.length}-${lastStepWasError}`}
                className={cn(
                  "text-xs",
                  lastStepWasError ? "text-red-500" : "text-muted-foreground",
                )}
                animate={{
                  scale: lastStepWasError ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.25 }}
              >
                {correctSteps}/7 etapas concluídas
              </motion.p>
            </div>
          )}

          {!isTablet && (
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-green-600 px-4 py-3 text-center text-white"
                >
                  🎉 Desafio diário concluído!
                </motion.div>
              ) : inProgress ? (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <TaxonomicPath activeIndex={expandedNodes.length} />
                </motion.div>
              ) : (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-accent/40 rounded-xl p-6 text-center"
                >
                  <p className="mb-2 text-lg font-semibold">Missão do dia</p>
                  <p className="text-muted-foreground text-sm">
                    Complete o caminho taxonômico antes do tempo acabar para
                    ganhar recompensas e manter seu streak diário.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {!isCompleted && (
            <Button
              size="lg"
              className={cn(
                "text-lg transition-all md:mt-2 md:p-6",
                inProgress
                  ? "bg-red-500 hover:bg-red-500/90"
                  : "bg-emerald-600 hover:bg-emerald-600/90",
              )}
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
