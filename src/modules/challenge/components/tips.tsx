import * as Dialog from "@radix-ui/react-dialog";
import {
  Lightbulb,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Globe,
  ChevronDown,
  Info,
  CircleQuestionMarkIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { cn } from "@/common/utils/cn";
import * as Collapsible from "@radix-ui/react-collapsible";
import type { Rank } from "@/common/types/api";
import { useAtomValue, useSetAtom } from "jotai";
import {
  scrollToRankAtom,
  setHighlightedKeysAtom,
  scrollToNodeKeyAtom,
  setChallengeTipsOpenAtom,
  treeAtom,
} from "@/store/tree";
import { useTranslation } from "react-i18next";
import { useGetChallengeTips } from "@/hooks/queries/useGetChallengeTips";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetSpecieImage } from "@/hooks/queries/useGetSpecieImage";
import { useGetVernacularNames } from "@/hooks/queries/useGetVernacularNames";
import { Image } from "@/common/components/image";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useResponsive } from "@/hooks/use-responsive";

type PathNode = { rank: Rank; name: string; key: number };

export type StepInteractionType =
  | "tipsViewed"
  | "answerRevealed"
  | "namesExpanded"
  | "imageExpanded";

const RANK_LABELS: Partial<Record<Rank, string>> = {
  KINGDOM: "reino",
  SUBKINGDOM: "subreino",
  PHYLUM: "filo",
  SUBPHYLUM: "subfilo",
  SUPERCLASS: "superclasse",
  CLASS: "classe",
  SUBCLASS: "subclasse",
  SUPERORDER: "superordem",
  ORDER: "ordem",
  SUBORDER: "subordem",
  SUPERFAMILY: "superfamília",
  FAMILY: "família",
  SUBFAMILY: "subfamília",
  GENUS: "gênero",
  SUBGENUS: "subgênero",
  SPECIES: "espécie",
  SUBSPECIES: "subespécie",
};

const getRankLabel = (rank: Rank): string =>
  RANK_LABELS[rank] ?? rank.toLowerCase().replace(/_/g, " ");

export const ChallengeTips = ({
  speciesName,
  speciesKey,
  currentStep,
  errorIndex,
  correctPath,
  onInteraction,
}: {
  speciesName: string;
  speciesKey: number;
  currentStep: number;
  errorIndex: number | null;
  correctPath: PathNode[];
  onInteraction?: (step: number, type: StepInteractionType) => void;
}) => {
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>(
    {},
  );
  const [open, setOpen] = useState(false);
  const [visibleStep, setVisibleStep] = useState(currentStep);
  const allNodes = useAtomValue(treeAtom.nodes);
  const setHighlightedKeys = useSetAtom(setHighlightedKeysAtom);
  const setScrollToNodeKey = useSetAtom(scrollToNodeKeyAtom);
  const setScrollToRank = useSetAtom(scrollToRankAtom);
  const setTipsOpen = useSetAtom(setChallengeTipsOpenAtom);

  const dragControls = useDragControls();

  const { data: tipsMap = {} } = useGetChallengeTips(correctPath);
  const { data: specieDetail } = useGetSpecieDetail({ specieKey: speciesKey });
  const { data: imageData, isLoading: isLoadingImage } = useGetSpecieImage(
    speciesKey,
    specieDetail?.canonicalName,
  );
  const { data: vernacularNames = [], isLoading: isLoadingVernacular } =
    useGetVernacularNames(speciesKey);

  const currentNode = correctPath[visibleStep];
  const hints: string[] = currentNode ? (tipsMap[currentNode.name] ?? []) : [];
  const isRevealed = revealedSteps[visibleStep] === true;

  const revealStep = () => {
    setRevealedSteps((prev) => ({ ...prev, [visibleStep]: true }));
    onInteraction?.(visibleStep, "answerRevealed");
  };

  const WINDOW = 3;

  const hasSiblingsRef = useRef(false);

  const applyHighlights = useCallback(
    (step: number, nodes: typeof allNodes): boolean => {
      const node = correctPath[step];
      if (!node) return false;

      const parentKey = step > 0 ? correctPath[step - 1].key : null;
      const siblings: number[] = parentKey
        ? (nodes[parentKey]?.childrenKeys ?? [])
        : [];

      let selected: number[];
      if (siblings.length === 0) {
        selected = [node.key];
      } else {
        const correctIdx = siblings.indexOf(node.key);
        if (correctIdx === -1) {
          selected = [node.key, ...siblings.slice(0, WINDOW - 1)];
        } else {
          const minOffset = Math.max(0, correctIdx + WINDOW - siblings.length);
          const maxOffset = Math.min(WINDOW - 1, correctIdx);
          if (maxOffset < minOffset) {
            selected = [...siblings];
          } else {
            const offset =
              Math.floor(Math.random() * (maxOffset - minOffset + 1)) +
              minOffset;
            const start = correctIdx - offset;
            selected = siblings.slice(start, start + WINDOW);
          }
        }
      }

      setHighlightedKeys(selected);
      setScrollToNodeKey(node.key);
      setScrollToRank(node.rank);
      return siblings.length > 0;
    },
    [correctPath, setHighlightedKeys, setScrollToNodeKey, setScrollToRank],
  );

  const goToStep = (next: number) => {
    setVisibleStep(next);
    hasSiblingsRef.current = false;
    const hadSiblings = applyHighlights(next, allNodes);
    hasSiblingsRef.current = hadSiblings;
    onInteraction?.(next, "tipsViewed");
  };

  useEffect(() => {
    if (!open) return;
    setVisibleStep(currentStep);
    hasSiblingsRef.current = false;
    const hadSiblings = applyHighlights(currentStep, allNodes);
    hasSiblingsRef.current = hadSiblings;
    onInteraction?.(currentStep, "tipsViewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    if (!open || hasSiblingsRef.current) return;
    const node = correctPath[visibleStep];
    if (!node) return;
    const parentKey =
      visibleStep > 0 ? correctPath[visibleStep - 1]?.key : null;
    if (!parentKey || !allNodes[parentKey]?.childrenKeys?.length) return;
    hasSiblingsRef.current = true;
    applyHighlights(visibleStep, allNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNodes]);

  return (
    <Dialog.Root
      modal={false}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (isTablet) setTipsOpen(nextOpen);
        if (nextOpen) {
          setVisibleStep(currentStep);
          goToStep(currentStep);
        } else {
          setHighlightedKeys([]);
          setScrollToRank(null);
          setScrollToNodeKey(null);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button
          className={cn(
            "bg-muted/50 flex w-full items-center justify-between rounded-xl border border-dashed px-3 py-2 text-xs transition-colors",
          )}
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb
              className={cn(
                "size-3.5 text-amber-500",
                errorIndex !== null && "fill-amber-300",
              )}
            />
            <span
              className={cn(
                errorIndex !== null
                  ? "font-medium text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground",
              )}
            >
              {errorIndex !== null
                ? t("challenge.needHelp")
                : t("challenge.tips")}
            </span>
          </div>
          <span className="text-muted-foreground/50 text-[10px]">→</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content
          asChild
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <motion.div
            // Desktop: draggable, positioned to avoid overlap with the right panel
            // Mobile: fixed centered at top (original behaviour)
            drag={!isTablet}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-background fixed top-2 left-1/2 z-50 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-xl border p-4 shadow-lg"
          >
            {/* Mobile-only: target species name so it stays visible when dialog overlaps tree */}
            {isTablet && (
              <div className="mb-2.5 flex items-center gap-1.5 border-b pb-2.5">
                <span className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-wide uppercase">
                  Alvo
                </span>
                <span className="truncate text-sm font-bold text-emerald-600 italic dark:text-green-400">
                  {speciesName}
                </span>
              </div>
            )}

            <header
              className={cn(
                "mb-2 flex items-center justify-between",
                !isTablet && "cursor-grab active:cursor-grabbing",
              )}
              onPointerDown={
                !isTablet ? (e) => dragControls.start(e) : undefined
              }
            >
              <div className="flex max-h-[45dvh] items-center gap-2 overflow-y-auto">
                <button
                  onClick={() => goToStep(visibleStep - 1)}
                  disabled={visibleStep === 0}
                  className="hover:bg-muted rounded p-1 disabled:opacity-30"
                  aria-label={t("challenge.prevStep")}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <ChevronLeft className="size-4" />
                </button>

                <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
                  {t("challenge.step")} {visibleStep + 1} {t("challenge.of")}{" "}
                  {correctPath.length}
                </Dialog.Title>

                <button
                  onClick={() => goToStep(visibleStep + 1)}
                  disabled={visibleStep === currentStep}
                  className="hover:bg-muted rounded p-1 disabled:opacity-30"
                  aria-label={t("challenge.nextStep")}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <Dialog.Close
                className="hover:bg-muted rounded p-1"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <X className="size-3.5" />
              </Dialog.Close>
            </header>

            {hints.length > 0 ? (
              <div className="bg-muted/40 mt-3 rounded-lg border p-3 text-sm">
                {hints.map((hint, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span>💡</span>
                    <span className="flex-1">{hint}</span>
                  </div>
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
                        {getRankLabel(currentNode.rank)}{" "}
                        <span className="font-bold text-green-600">
                          {currentNode.name}
                        </span>
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            <Collapsible.Root className="mt-3">
              <Collapsible.Trigger asChild>
                <button className="text-muted-foreground hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Info className="size-3.5" />
                    Mais informações
                  </div>
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content className="mt-1 space-y-1 overflow-hidden">
                <Collapsible.Root
                  onOpenChange={(isOpen) => {
                    if (isOpen) onInteraction?.(visibleStep, "namesExpanded");
                  }}
                >
                  <Collapsible.Trigger asChild>
                    <button className="text-muted-foreground hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Globe className="size-3.5" />
                        Nomes populares
                      </div>
                      <ChevronDown className="size-3.5 opacity-60" />
                    </button>
                  </Collapsible.Trigger>

                  <Collapsible.Content className="mt-2 overflow-hidden rounded-md border p-2">
                    {isLoadingVernacular ? (
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : vernacularNames.length === 0 ? (
                      <div className="text-muted-foreground text-xs">
                        Nenhum nome popular encontrado.
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {vernacularNames.map((v, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="bg-muted text-muted-foreground rounded px-1 py-0.5 font-mono text-[10px]">
                              {v.language || "—"}
                            </span>
                            <span>{v.vernacularName}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Collapsible.Content>
                </Collapsible.Root>

                <Collapsible.Root
                  onOpenChange={(isOpen) => {
                    if (isOpen) onInteraction?.(visibleStep, "imageExpanded");
                  }}
                >
                  <Collapsible.Trigger asChild>
                    <button className="text-muted-foreground hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="size-3.5" />
                        Imagem da espécie
                      </div>
                      <ChevronDown className="size-3.5 opacity-60" />
                    </button>
                  </Collapsible.Trigger>

                  <Collapsible.Content className="mt-2 overflow-hidden rounded-md border">
                    {isLoadingImage ? (
                      <Skeleton className="h-32 w-full" />
                    ) : imageData?.imgUrl ? (
                      <Image
                        src={imageData.imgUrl}
                        alt={speciesName}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-32 items-center justify-center text-xs">
                        Imagem não disponível
                      </div>
                    )}
                  </Collapsible.Content>
                </Collapsible.Root>

                <Collapsible.Root>
                  <Collapsible.Trigger asChild>
                    <button className="text-muted-foreground hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CircleQuestionMarkIcon className="size-3.5" />
                        {t("challenge.howItWorks")}
                      </div>
                      <ChevronDown className="size-3.5 opacity-60" />
                    </button>
                  </Collapsible.Trigger>

                  <Collapsible.Content className="text-muted-foreground bg-muted/40 mt-2 rounded-md p-3 text-sm">
                    Expanda os grupos da árvore taxonômica seguindo o caminho
                    correto até chegar à espécie{" "}
                    <span className="font-semibold text-emerald-500">
                      {speciesName}
                    </span>
                    .
                  </Collapsible.Content>
                </Collapsible.Root>
              </Collapsible.Content>
            </Collapsible.Root>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
