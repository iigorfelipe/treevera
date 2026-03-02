import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Eye,
  Globe,
  ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/utils/cn";
import type { StepInteractionType } from "@/modules/challenge/components/tips";

type StepInteractions = Record<
  number,
  Partial<Record<StepInteractionType, boolean>>
>;

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
};

interface StepEntry {
  rank: string;
  name: string;
}

interface ChallengeCompletedProps {
  speciesName: string;
  onReplay: () => void;
  onNext: () => void;
  nextLabel: string;
  nextLoading?: boolean;
  children?: React.ReactNode;
  elapsedSeconds?: number;
  errorCount?: number;
  totalSteps?: number;
  correctPath?: StepEntry[];
  stepErrors?: number[];
  stepInteractions?: StepInteractions;
}

export const ChallengeCompleted = ({
  speciesName,
  onReplay,
  onNext,
  nextLabel,
  nextLoading = false,
  children,
  elapsedSeconds,
  errorCount,
  totalSteps,
  correctPath,
  stepErrors = [],
  stepInteractions,
}: ChallengeCompletedProps) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const accuracy =
    errorCount !== undefined && totalSteps !== undefined && totalSteps > 0
      ? Math.round((totalSteps / (totalSteps + errorCount)) * 100)
      : undefined;

  const hasStats = elapsedSeconds !== undefined || errorCount !== undefined;
  const hasStepData = correctPath && correctPath.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-card mx-auto w-full max-w-lg rounded-2xl border p-5 text-center shadow-sm md:mt-5"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500 md:size-16"
      >
        <Trophy className="size-6 text-white md:size-8" />
      </motion.div>
      <p className="text-sm font-semibold text-emerald-600 md:text-lg dark:text-emerald-400">
        {t("challenge.completed")}
      </p>
      <p className="mt-1 text-sm md:text-lg">
        <strong>{speciesName}</strong>
      </p>

      {hasStepData && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4"
        >
          <div className="flex gap-1">
            {correctPath.map((_, i) => {
              const errors = stepErrors[i] ?? 0;
              const isPerfect = errors === 0;
              const isActive = activeStep === i;

              return (
                <button
                  key={i}
                  onClick={() => setActiveStep(isActive ? null : i)}
                  aria-pressed={isActive}
                  className={cn(
                    "h-4 min-w-3 flex-1 rounded-full transition-all",
                    isPerfect
                      ? "bg-emerald-500"
                      : "bg-yellow-400 dark:bg-yellow-500",
                    isActive
                      ? "ring-offset-card opacity-80 ring-2 ring-white/60 ring-offset-1"
                      : "hover:opacity-75",
                  )}
                />
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeStep !== null && (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-2 rounded-xl border p-3 text-left text-xs">
                  <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wide uppercase">
                    {correctPath[activeStep].rank
                      .toLowerCase()
                      .replace(/_/g, " ")}
                  </p>
                  <p className="mb-2 text-sm font-semibold">
                    {correctPath[activeStep].name}
                  </p>

                  <div className="text-muted-foreground flex flex-wrap gap-3">
                    <span>
                      {t("challenge.stepAttempts", {
                        count: (stepErrors[activeStep] ?? 0) + 1,
                      })}
                    </span>
                    {(stepErrors[activeStep] ?? 0) > 0 && (
                      <span className="text-orange-500">
                        {t("challenge.stepErrors", {
                          count: stepErrors[activeStep],
                        })}
                      </span>
                    )}
                  </div>

                  {(() => {
                    const inter = stepInteractions?.[activeStep];
                    if (!inter) return null;
                    const badges: { icon: React.ElementType; label: string }[] =
                      [];
                    if (inter.tipsViewed)
                      badges.push({
                        icon: Lightbulb,
                        label: t("challenge.interactionTips"),
                      });
                    if (inter.answerRevealed)
                      badges.push({
                        icon: Eye,
                        label: t("challenge.interactionRevealed"),
                      });
                    if (inter.namesExpanded)
                      badges.push({
                        icon: Globe,
                        label: t("challenge.interactionNames"),
                      });
                    if (inter.imageExpanded)
                      badges.push({
                        icon: ImageIcon,
                        label: t("challenge.interactionImage"),
                      });
                    if (badges.length === 0) return null;
                    return (
                      <div className="mt-2 flex flex-wrap gap-1.5 border-t pt-2">
                        {badges.map(({ icon: Icon, label }, j) => (
                          <span
                            key={j}
                            className="bg-muted flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
                          >
                            <Icon className="size-2.5 text-amber-500" />
                            {label}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {hasStats && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex divide-x overflow-hidden rounded-xl border"
        >
          {elapsedSeconds !== undefined && (
            <div className="flex-1 px-3 py-2.5 text-center">
              <div className="text-base font-bold tabular-nums">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
                {t("challenge.timeTaken")}
              </div>
            </div>
          )}
          {errorCount !== undefined && (
            <div className="flex-1 px-3 py-2.5 text-center">
              <div
                className={cn(
                  "text-base font-bold tabular-nums",
                  errorCount === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-orange-500",
                )}
              >
                {errorCount}
              </div>
              <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
                {t("challenge.errorsLabel")}
              </div>
            </div>
          )}
          {accuracy !== undefined && (
            <div className="flex-1 px-3 py-2.5 text-center">
              <div
                className={cn(
                  "text-base font-bold tabular-nums",
                  accuracy >= 80
                    ? "text-emerald-600 dark:text-emerald-400"
                    : accuracy >= 50
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-500",
                )}
              >
                {accuracy}%
              </div>
              <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
                {t("challenge.accuracyLabel")}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center"
      >
        <Button variant="outline" onClick={onReplay} className="gap-2">
          <RotateCcw className="size-4" />
          {t("challenge.replay")}
        </Button>

        <Button
          onClick={onNext}
          disabled={nextLoading}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {nextLabel}
          <ChevronRight className="size-4" />
        </Button>
      </motion.div>
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-5"
        >
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t" />
            <span className="text-muted-foreground shrink-0 text-xs">
              {t("challenge.orPlayOtherDate")}
            </span>
            <div className="flex-1 border-t" />
          </div>
          <div className="mt-3">{children}</div>
        </motion.div>
      )}
    </motion.div>
  );
};
