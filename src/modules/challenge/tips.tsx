import type { TipsData } from "@/common/constants/challenge";
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

export const ChallengeTips = ({
  speciesName,
  currentStep,
  errorIndex,
  tips,
}: {
  speciesName: string;
  currentStep: number;
  errorIndex: number | null;
  tips: TipsData;
}) => {
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>(
    {},
  );
  const [visibleStep, setVisibleStep] = useState(currentStep);

  const stepTip = tips.steps.find((s) => s.step === visibleStep);

  const isRevealed = revealedSteps[visibleStep] === true;

  const revealStep = () => {
    setRevealedSteps((prev) => ({
      ...prev,
      [visibleStep]: true,
    }));
  };

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) setVisibleStep(currentStep);
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
            <span>Dicas para avançar</span>
          </div>

          {errorIndex && (
            <span className="text-muted-foreground text-xs">
              Precisa de ajuda?
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />

        <Dialog.Content>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-background fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border p-4 shadow-lg"
          >
            <header className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVisibleStep((s) => Math.max(0, s - 1))}
                  disabled={visibleStep === 0}
                  className="hover:bg-muted rounded p-1 disabled:opacity-30"
                  aria-label="Etapa anterior"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy className="size-4 text-emerald-500" />
                  Etapa {visibleStep + 1} de {tips.steps.length}
                </Dialog.Title>

                <button
                  onClick={() =>
                    setVisibleStep((s) => Math.min(currentStep, s + 1))
                  }
                  disabled={visibleStep === currentStep}
                  className="hover:bg-muted rounded p-1 disabled:opacity-30"
                  aria-label="Próxima etapa"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <Dialog.Close className="hover:bg-muted rounded p-1">
                <X className="size-4" />
              </Dialog.Close>
            </header>

            <div className="text-muted-foreground space-y-2 text-sm">
              {tips.general.map((tip, i) => (
                <p key={i}>• {tip}</p>
              ))}
            </div>

            {stepTip && (
              <div className="bg-muted/40 mt-3 rounded-lg border p-3 text-sm">
                {stepTip.hints.map((hint, i) => (
                  <p key={i}>💡 {hint}</p>
                ))}
              </div>
            )}

            {stepTip && (
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
                        Revelar resposta desta etapa
                      </button>
                    ) : (
                      <p className="text-foreground font-medium">
                        {speciesName} pertence ao{" "}
                        <strong>{stepTip!.classification}</strong>{" "}
                        {stepTip!.answer}.
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>{" "}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
