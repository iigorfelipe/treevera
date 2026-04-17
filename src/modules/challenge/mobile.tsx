import { motion } from "framer-motion";
import { Shuffle, X, Share2, RotateCcw } from "lucide-react";

import { useTranslation } from "react-i18next";
import { ProgressSteps } from "./components/progress-steps";
import { ChallengeTips, type StepInteractionType } from "./components/tips";
import type { Rank } from "@/common/types/api";
import { TargetVideo } from "./components/target-video";

type PathNode = { rank: Rank; name: string; key: number };

export const ChallengeMobile = ({
  speciesName,
  speciesKey,
  correctSteps,
  isCompleted,
  onCancel,
  onRestart,
  onNext,
  nextLoading,
  errorIndex,
  correctPath,
  errorCount = 0,
  onInteraction,
  onShare,
}: {
  speciesName: string;
  speciesKey: number;
  correctSteps: number;
  isCompleted: boolean;
  onCancel: () => void;
  onRestart?: () => void;
  onNext?: () => void;
  nextLoading?: boolean;
  errorIndex: number | null;
  correctPath: PathNode[];
  errorCount?: number;
  onInteraction?: (step: number, type: StepInteractionType) => void;
  onShare?: () => void;
}) => {
  const { t } = useTranslation();

  const activeRank = correctPath[correctSteps]?.rank;

  return (
    <div className="px-2">
      <motion.div className="rounded-2xl border px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <TargetVideo className="size-5 shrink-0" />

          <span className="text-muted-foreground text-xs font-semibold tabular-nums">
            {correctSteps}/{correctPath.length}
          </span>

          {activeRank && (
            <span className="text-muted-foreground text-[10px] font-medium">
              {activeRank.toLowerCase().replace(/_/g, " ")}
            </span>
          )}

          {errorCount > 0 && (
            <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              {errorCount}×
            </span>
          )}

          <div className="ml-auto flex items-center gap-0.5">
            {onNext && (
              <button
                onClick={onNext}
                disabled={nextLoading}
                className="text-muted-foreground/60 rounded-full p-1 hover:bg-violet-100 hover:text-violet-600 disabled:opacity-50 dark:hover:bg-violet-950"
                aria-label={t("challenge.nextChallenge")}
              >
                <Shuffle className="size-3.5" />
              </button>
            )}

            {onRestart && (
              <button
                onClick={onRestart}
                className="text-muted-foreground/60 hover:bg-muted hover:text-foreground rounded-full p-1"
                aria-label={t("challenge.restart")}
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}

            {onShare && (
              <button
                onClick={onShare}
                className="text-muted-foreground/60 hover:bg-muted hover:text-foreground rounded-full p-1"
                aria-label={t("challenge.share")}
              >
                <Share2 className="size-3.5" />
              </button>
            )}

            <button
              onClick={onCancel}
              className="text-muted-foreground/60 rounded-full p-1 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950"
              aria-label={t("challenge.cancel")}
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {!isCompleted && correctPath.length > 0 && (
          <>
            <div className="mt-1.5">
              <ProgressSteps
                correctSteps={correctSteps}
                errorIndex={errorIndex}
                totalSteps={correctPath.length}
              />
            </div>

            <p className="mt-1.5 text-sm font-bold text-emerald-600 dark:text-green-400">
              {speciesName}
            </p>

            <div className="mt-1">
              <ChallengeTips
                speciesName={speciesName}
                speciesKey={speciesKey}
                currentStep={correctSteps}
                errorIndex={errorIndex}
                correctPath={correctPath}
                onInteraction={onInteraction}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
