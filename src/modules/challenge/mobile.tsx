import { Image } from "@/common/components/image";
import Alvo from "@/assets/alvo.gif";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { useTranslation } from "react-i18next";
import { ProgressSteps, TOTAL_STEPS } from "./components/progress-steps";
import { ChallengeTips } from "./components/tips";
import type { Rank } from "@/common/types/api";

type PathNode = { rank: Rank; name: string };

export const ChallengeMobile = ({
  speciesName,
  speciesKey,
  correctSteps,
  isCompleted,
  onCancel,
  errorIndex,
  correctPath,
}: {
  speciesName: string;
  speciesKey: number;
  correctSteps: number;
  isCompleted: boolean;
  onCancel: () => void;
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
            <span className="text-muted-foreground">
              {t("challenge.find")}{" "}
            </span>
            <span className="font-bold text-emerald-600 dark:text-green-400">
              {speciesName}
            </span>
          </p>

          <span className="text-muted-foreground text-xs font-semibold tabular-nums">
            {correctSteps}/{TOTAL_STEPS}
          </span>

          <button
            onClick={onCancel}
            className="text-muted-foreground/60 ml-auto rounded-full p-1 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950"
            aria-label={t("challenge.cancel")}
          >
            <X className="size-3.5" />
          </button>
        </div>
        {!isCompleted && correctPath.length > 0 && (
          <>
            <ProgressSteps
              correctSteps={correctSteps}
              errorIndex={errorIndex}
            />

            <ChallengeTips
              speciesName={speciesName}
              speciesKey={speciesKey}
              currentStep={correctSteps}
              errorIndex={errorIndex}
              correctPath={correctPath}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};
