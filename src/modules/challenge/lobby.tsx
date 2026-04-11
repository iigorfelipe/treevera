import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { AnimatePresence, motion } from "framer-motion";

import { DailyChallengeCard } from "@/modules/challenge/daily/daily-challenge";
import { RandomChallengeCard } from "@/modules/challenge/random/random-challenge";
import { CustomChallengeCard } from "@/modules/challenge/custom/custom-challenge-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Link } from "@tanstack/react-router";
import { authStore } from "@/store/auth/atoms";
import { treeAtom } from "@/store/tree";
import { useGetRecentChallenges } from "@/hooks/queries/useGetRecentChallenges";
import { useGetUserCustomChallenges } from "@/hooks/queries/useGetUserCustomChallenges";
import { useGetChallengeStats } from "@/hooks/queries/useGetChallengeStats";
import { useGetChallengeDates } from "@/hooks/queries/useGetChallengeDates";
import { deleteCustomChallenge } from "@/common/utils/supabase/challenge/custom-challenges";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { formatActivityDate } from "@/common/utils/date-formats";
import { cn } from "@/common/utils/cn";
import type { UserCustomChallenge } from "@/common/types/api";

const DEFAULT_VISIBLE = 3;

const SectionHeader = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-end justify-between border-b pb-1 uppercase">
    <h2>{title}</h2>
    {children}
  </div>
);

export const HowToPlay = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const steps = [
    t("challenge.howToPlay1"),
    t("challenge.howToPlay2"),
    t("challenge.howToPlay3"),
    t("challenge.howToPlay4"),
    t("challenge.howToPlay5"),
  ];

  return (
    <div className="space-y-3">
      <SectionHeader title={t("challenge.howToPlay")}>
        <button
          onClick={() => setOpen((p) => !p)}
          className="text-muted-foreground flex items-center"
        >
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </SectionHeader>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            key="how-to-play"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="bg-primary text-primary-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
};

const calcStreak = (dates: { date: string; completed: boolean }[]): number => {
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const dateMap = new Map(dates.map((d) => [d.date, d.completed]));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const key = fmt(new Date(today.getTime() - i * 86400000));
    if (!dateMap.get(key)) break;
    streak++;
  }
  return streak;
};

const ChallengeStatsCards = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const { data: stats } = useGetChallengeStats();
  const { data: dates = [] } = useGetChallengeDates();

  if (!isAuthenticated) return null;

  const streak = calcStreak(dates);

  const cards = [
    { label: t("challenge.statsDailyCompleted"), value: stats?.dailyCount ?? 0 },
    { label: t("challenge.statsRandomCompleted"), value: stats?.randomCount ?? 0 },
    { label: t("challenge.statsStreak"), value: streak },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <div key={card.label} className="border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold tabular-nums">
            {card.value}
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs leading-tight">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
};

const RecentChallenges = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const setChallenge = useSetAtom(treeAtom.challenge);
  const [expanded, setExpanded] = useState(false);
  const { data: recent = [], isLoading } = useGetRecentChallenges();

  if (!isAuthenticated) return null;

  const modeLabel: Record<string, string> = {
    DAILY: t("challenge.modeDaily"),
    RANDOM: t("challenge.modeRandom"),
    CUSTOM: t("challenge.modeCustom"),
  };

  const visible = expanded ? recent : recent.slice(0, DEFAULT_VISIBLE);
  const hasMore = recent.length > DEFAULT_VISIBLE;

  return (
    <div className="space-y-3">
      <SectionHeader title={t("challenge.recentChallenges")}>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 px-2 text-xs"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? t("lists.collapse") : t("lists.expand")}
            {expanded ? (
              <ChevronUp className="ml-1 size-3" />
            ) : (
              <ChevronDown className="ml-1 size-3" />
            )}
          </Button>
        )}
      </SectionHeader>

      {isLoading ? (
        <Loader2 className="text-muted-foreground size-4 animate-spin" />
      ) : recent.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("challenge.noRecentChallenges")}
        </p>
      ) : (
        <div
          className={cn(
            "flex flex-col",
            expanded && hasMore && "max-h-60 overflow-y-auto pr-1",
          )}
        >
          {visible.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between gap-4 border-b py-2 last:border-0"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-muted-foreground text-xs font-semibold">
                  {modeLabel[item.mode] ?? item.mode}
                </span>
                {item.gbif_key ? (
                  <Link
                    to="/specie-detail/$specieKey"
                    params={{ specieKey: String(item.gbif_key) }}
                    className="hover:underline truncate text-sm"
                  >
                    {item.species_name ?? "—"}
                  </Link>
                ) : (
                  <span className="truncate text-sm">{item.species_name ?? "—"}</span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => {
                    if (!item.gbif_key || !item.species_name) return;
                    if (item.mode === "DAILY") {
                      setChallenge({
                        mode: "DAILY",
                        status: "IN_PROGRESS",
                        targetSpecies: item.species_name,
                        speciesKey: item.gbif_key,
                        challengeDate: item.challenge_date,
                        startedAt: Date.now(),
                        errorTracking: { count: 0, perStep: [] },
                        stepInteractions: {},
                      });
                    } else if (item.mode === "CUSTOM") {
                      setChallenge({
                        mode: "CUSTOM",
                        status: "IN_PROGRESS",
                        targetSpecies: item.species_name,
                        speciesKey: item.gbif_key,
                        startedAt: Date.now(),
                        errorTracking: { count: 0, perStep: [] },
                        stepInteractions: {},
                      });
                    } else {
                      setChallenge({
                        mode: "RANDOM",
                        status: "IN_PROGRESS",
                        targetSpecies: item.species_name,
                        speciesKey: item.gbif_key,
                        startedAt: Date.now(),
                        errorTracking: { count: 0, perStep: [] },
                        stepInteractions: {},
                      });
                    }
                  }}
                  disabled={!item.gbif_key || !item.species_name}
                  className={cn(
                    "cursor-pointer rounded px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100",
                    item.mode === "DAILY" &&
                      "bg-emerald-500 hover:bg-emerald-600",
                    item.mode === "RANDOM" &&
                      "bg-violet-600 hover:bg-violet-700",
                    item.mode === "CUSTOM" && "bg-muted-foreground",
                    (!item.gbif_key || !item.species_name) &&
                      "cursor-not-allowed",
                  )}
                >
                  {t("challenge.play")}
                </button>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatActivityDate(item.completed_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MyCustomChallengeItem = ({
  challenge,
  onDelete,
}: {
  challenge: UserCustomChallenge;
  onDelete: (id: string) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const setChallenge = useSetAtom(treeAtom.challenge);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePlay = () => {
    setChallenge({
      mode: "CUSTOM",
      status: "IN_PROGRESS",
      targetSpecies: challenge.species_name,
      speciesKey: challenge.gbif_key,
      startedAt: Date.now(),
      errorTracking: { count: 0, perStep: [] },
      stepInteractions: {},
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    await onDelete(challenge.id);
    setDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="group flex items-center justify-between gap-4 border-b py-2 last:border-0">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-muted-foreground text-xs font-semibold">
            {t("challenge.modeCustom")}
          </span>
          <Link
            to="/specie-detail/$specieKey"
            params={{ specieKey: String(challenge.gbif_key) }}
            className="hover:underline truncate text-sm"
          >
            {challenge.species_name}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handlePlay}
            className="bg-muted-foreground cursor-pointer rounded px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            {t("challenge.play")}
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label={t("challenge.customDelete")}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("challenge.customDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("challenge.customDeleteConfirm", {
                name: challenge.species_name,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              {t("challenge.customDeleteCancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t("challenge.customDeleteConfirmBtn")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const MyCustomChallenges = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const session = useAtomValue(authStore.session);
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const { data: challenges = [], isLoading } = useGetUserCustomChallenges();

  if (!isAuthenticated) return null;

  const visible = expanded ? challenges : challenges.slice(0, DEFAULT_VISIBLE);
  const hasMore = challenges.length > DEFAULT_VISIBLE;

  const handleDelete = async (id: string) => {
    if (!userId) return;
    await deleteCustomChallenge(userId, id);
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.user_custom_challenges_key, userId],
    });
    toast.success(t("challenge.customDeleted"));
  };

  return (
    <div className="space-y-3">
      <SectionHeader title={t("challenge.myChallenges")}>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 px-2 text-xs"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? t("lists.collapse") : t("lists.expand")}
            {expanded ? (
              <ChevronUp className="ml-1 size-3" />
            ) : (
              <ChevronDown className="ml-1 size-3" />
            )}
          </Button>
        )}
      </SectionHeader>

      {isLoading ? (
        <Loader2 className="text-muted-foreground size-4 animate-spin" />
      ) : challenges.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("challenge.noMyChallenges")}
        </p>
      ) : (
        <div
          className={cn(
            "flex flex-col",
            expanded && hasMore && "max-h-60 overflow-y-auto pr-1",
          )}
        >
          {visible.map((c) => (
            <MyCustomChallengeItem
              key={c.id}
              challenge={c}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ChallengesLobby = ({ dayKey }: { dayKey: string }) => {
  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
        <div className="flex shrink-0 flex-col gap-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={dayKey}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <DailyChallengeCard />
            </motion.div>
          </AnimatePresence>

          <RandomChallengeCard />

          <CustomChallengeCard />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-8 max-w-[864px]">
          <ChallengeStatsCards />
          <HowToPlay />
          <RecentChallenges />
          <MyCustomChallenges />
        </div>
      </div>
    </div>
  );
};
