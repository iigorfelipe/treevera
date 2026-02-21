import * as Dialog from "@radix-ui/react-dialog";
import {
  Lightbulb,
  X,
  Eye,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/common/utils/cn";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, Info } from "lucide-react";
import type { Rank } from "@/common/types/api";
import { useSetAtom } from "jotai";
import { scrollToRankAtom, treeAtom } from "@/store/tree";
import { useTranslation } from "react-i18next";
import { useGetChallengeTips } from "@/hooks/queries/useGetChallengeTips";

type PathNode = { rank: Rank; name: string };

const RANK_LABELS: Record<Rank, string> = {
  KINGDOM: "reino",
  PHYLUM: "filo",
  CLASS: "classe",
  ORDER: "ordem",
  FAMILY: "família",
  GENUS: "gênero",
  SPECIES: "espécie",
};

export const ChallengeTips = ({
  speciesName,
  currentStep,
  errorIndex,
  correctPath,
}: {
  speciesName: string;
  currentStep: number;
  errorIndex: number | null;
  correctPath: PathNode[];
}) => {
  const { t } = useTranslation();
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>(
    {},
  );
  const [open, setOpen] = useState(false);
  const setHighlightedRank = useSetAtom(treeAtom.highlightedRank);
  const [visibleStep, setVisibleStep] = useState(currentStep);
  const setScrollToRank = useSetAtom(scrollToRankAtom);

  const { data: tipsMap = {} } = useGetChallengeTips(correctPath);

  const currentNode = correctPath[visibleStep];
  const hints: string[] = currentNode ? (tipsMap[currentNode.name] ?? []) : [];
  const isRevealed = revealedSteps[visibleStep] === true;

  const revealStep = () => {
    setRevealedSteps((prev) => ({ ...prev, [visibleStep]: true }));
  };

  const goToStep = (next: number) => {
    setVisibleStep(next);
    const rank = correctPath[next]?.rank;
    if (rank) {
      setHighlightedRank(rank);
      setScrollToRank(rank);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setVisibleStep(currentStep);
          goToStep(currentStep);
        } else {
          setHighlightedRank(null);
          setScrollToRank(null);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button className="text-muted-foreground hover:bg-muted/50 mt-1 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Lightbulb
              className={cn(
                "size-3.5 text-amber-500",
                errorIndex && "fill-amber-300",
              )}
            />
            <span>{t("challenge.tips")}</span>
          </div>

          {errorIndex && (
            <span className="text-muted-foreground text-xs">
              {t("challenge.needHelp")}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-background fixed top-2 left-1/2 z-50 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-xl border p-4 shadow-lg"
          >
            <header className="mb-2 flex items-center justify-between">
              <div className="flex max-h-[45dvh] items-center gap-2 overflow-y-auto">
                <button
                  onClick={() => goToStep(visibleStep - 1)}
                  disabled={visibleStep === 0}
                  className="hover:bg-muted rounded p-1 disabled:opacity-30"
                  aria-label={t("challenge.prevStep")}
                >
                  <ChevronLeft className="size-4" />
                </button>

                <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="size-3.5 text-emerald-500" />
                  {t("challenge.step")} {visibleStep + 1} {t("challenge.of")}{" "}
                  {correctPath.length}
                </Dialog.Title>

                <button
                  onClick={() => goToStep(visibleStep + 1)}
                  disabled={visibleStep === currentStep}
                  className="hover:bg-muted rounded p-1 disabled:opacity-30"
                  aria-label={t("challenge.nextStep")}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <Dialog.Close className="hover:bg-muted rounded p-1">
                <X className="size-3.5" />
              </Dialog.Close>
            </header>

            {hints.length > 0 ? (
              <div className="bg-muted/40 mt-3 rounded-lg border p-3 text-sm">
                {hints.map((hint, i) => (
                  <p key={i}>💡 {hint}</p>
                ))}
              </div>
            ) : (
              <div className="bg-muted/40 text-muted-foreground mt-3 rounded-lg border p-3 text-sm">
                Sem dicas disponíveis para esta etapa.
              </div>
            )}

            {currentNode && (
              <div className="mt-4 rounded-lg border border-dashed p-3 text-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={visibleStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {!isRevealed ? (
                      <button
                        onClick={revealStep}
                        className="flex items-center gap-2 text-amber-600 hover:underline"
                      >
                        <Eye className="size-4" />
                        {t("challenge.revealAnswer")}
                      </button>
                    ) : (
                      <p className="text-foreground font-medium">
                        {speciesName} {t("challenge.belongsTo")}{" "}
                        {RANK_LABELS[currentNode.rank]}{" "}
                        <span className="font-bold text-green-600">
                          {currentNode.name}
                        </span>
                        .
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            <Collapsible.Root className="mt-4">
              <Collapsible.Trigger asChild>
                <button className="text-muted-foreground hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Info className="size-3.5" />
                    {t("challenge.howItWorks")}
                  </div>
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content asChild>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-muted-foreground bg-muted/40 mt-2 rounded-md p-3 text-sm"
                >
                  Expanda os grupos da árvore taxonômica seguindo o caminho
                  correto até chegar à espécie alvo.
                </motion.div>
              </Collapsible.Content>
            </Collapsible.Root>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
