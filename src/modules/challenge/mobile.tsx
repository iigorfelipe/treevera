import { Image } from "@/common/components/image";
import Alvo from "@/assets/alvo.gif";
import { motion } from "framer-motion";
import { Shuffle, X } from "lucide-react";

import { useTranslation } from "react-i18next";
import { ProgressSteps } from "./components/progress-steps";
import { ChallengeTips } from "./components/tips";
import type { Rank } from "@/common/types/api";

type PathNode = { rank: Rank; name: string; key: number };

export const ChallengeMobile = ({
  speciesName,
  speciesKey,
  correctSteps,
  isCompleted,
  onCancel,
  onNext,
  nextLoading,
  errorIndex,
  correctPath,
}: {
  speciesName: string;
  speciesKey: number;
  correctSteps: number;
  isCompleted: boolean;
  onCancel: () => void;
  onNext?: () => void;
  nextLoading?: boolean;
  errorIndex: number | null;
  correctPath: PathNode[];
}) => {
  const { t } = useTranslation();
  return (
    <div className="px-2">
      <motion.div className="rounded-2xl border px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Image src={Alvo} className="size-7 shrink-0" alt="Alvo gif" />
          <p className="truncate text-sm">
            <span className="font-bold text-emerald-600 dark:text-green-400">
              {speciesName}
            </span>
          </p>

          <span className="text-muted-foreground text-xs font-semibold tabular-nums">
            {correctSteps}/{correctPath.length}
          </span>

          {onNext && (
            <button
              onClick={onNext}
              disabled={nextLoading}
              className="text-muted-foreground/60 ml-auto rounded-full p-1 hover:bg-violet-100 hover:text-violet-600 disabled:opacity-50 dark:hover:bg-violet-950"
              aria-label={t("challenge.nextChallenge")}
            >
              <Shuffle className="size-3.5" />
            </button>
          )}

          <button
            onClick={onCancel}
            className={`rounded-full p-1 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950 ${onNext ? "" : "ml-auto"} text-muted-foreground/60`}
            aria-label={t("challenge.cancel")}
          >
            <X className="size-3.5" />
          </button>
        </div>
        {!isCompleted && correctPath.length > 0 && (
          <div className="space-y-2">
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
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
