import { motion } from "framer-motion";
import { Trophy, CheckCircle, RotateCcw, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/common/components/ui/button";

interface ChallengeCompletedProps {
  speciesName: string;
  onReplay: () => void;
  onNext: () => void;
  nextLabel: string;
  nextLoading?: boolean;
}

export const ChallengeCompleted = ({
  speciesName,
  onReplay,
  onNext,
  nextLabel,
  nextLoading = false,
}: ChallengeCompletedProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-mx-1 mx-auto rounded-2xl border bg-emerald-50/50 px-4 py-5 text-center shadow-sm md:mx-4 md:mt-20 dark:bg-emerald-950/30"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500 md:size-16"
      >
        <Trophy className="size-6 text-white md:size-8" />
      </motion.div>

      <p className="text-sm font-semibold text-emerald-700 md:text-lg dark:text-emerald-400">
        {t("challenge.completed")}
      </p>

      <p className="mt-1 text-sm md:text-lg">
        <strong>{speciesName}</strong>
      </p>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-muted-foreground mt-2 flex items-center justify-center gap-1 text-xs md:text-sm"
      >
        <CheckCircle className="size-3.5 text-emerald-500" />
        {t("challenge.path")}
      </motion.div>

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
    </motion.div>
  );
};
