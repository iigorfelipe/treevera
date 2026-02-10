import { getDailySpecies } from "@/common/utils/game/daily-species";
import { motion } from "framer-motion";
import { Trophy, CheckCircle } from "lucide-react";

export const ChallengeCompleted = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-2 rounded-2xl border bg-emerald-50/50 px-4 py-5 text-center shadow-sm dark:bg-emerald-950/30"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-500"
      >
        <Trophy className="size-6 text-white" />
      </motion.div>

      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        Classificação completa!
      </p>

      <p className="mt-1 text-sm">
        <strong>{getDailySpecies()}</strong>
      </p>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-muted-foreground mt-2 flex items-center justify-center gap-1 text-xs"
      >
        <CheckCircle className="size-3.5 text-emerald-500" />
        Reino → Espécie
      </motion.div>
    </motion.div>
  );
};
