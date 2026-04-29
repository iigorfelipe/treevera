import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  CheckCircle2,
  HelpCircle,
  Loader2,
  // MessageSquare,
  Play,
  Search,
} from "lucide-react";

import { Button } from "@/common/components/ui/button";
import {
  KEY_KINGDOM_BY_NAME,
  NAME_KINGDOM_BY_KEY,
} from "@/common/constants/tree";
import type { PathNode } from "@/common/types/tree-atoms";
import { ChallengeDatePicker } from "@/modules/challenge/daily/challenge-date-picker";
import { Timer } from "@/modules/challenge/components/timer";
import { FeaturedListCard } from "@/modules/lists/featured-list-card";
import { ListCreateDialog } from "@/modules/lists/list-create-dialog";
import { KingdomCardItem } from "@/modules/explore/kingdom-card";
import { useGetChallengeDates } from "@/hooks/queries/useGetChallengeDates";
import { useGetDailyChallenge } from "@/hooks/queries/useGetDailyChallenge";
import { useGetFeaturedLists } from "@/hooks/queries/useGetLists";
import { useScrollThenNavigate } from "@/hooks/use-scroll-then-navigate";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { authStore } from "@/store/auth/atoms";
import { treeAtom } from "@/store/tree";
import { getSpeciesSlugParam } from "@/common/utils/species-url";
import { slugify } from "@/common/utils/slugify";

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const calcDailyStreak = (dates: { date: string; completed: boolean }[]) => {
  const dateMap = new Map(dates.map((date) => [date.date, date.completed]));
  let streak = 0;

  for (let i = 0; i < 60; i++) {
    const key = getLocalDateKey(new Date(Date.now() - i * 86400000));
    if (!dateMap.get(key)) break;
    streak++;
  }

  return streak;
};

const POPULAR_SEARCHES = [
  { name: "Panthera onca", gbifKey: 5219426 },
  { name: "Gorilla gorilla", gbifKey: 2436441 },
  { name: "Tyrannosaurus rex", gbifKey: 4822633 },
] as const;

const FEATURED_LIST_SKELETON_KEYS = [0, 1, 2];

const DEFAULT_EXPANDED_KINGDOM_KEY = KEY_KINGDOM_BY_NAME.animalia;

const getKingdomCardDescriptionKey = (kingdomKey: number) => {
  const kingdomName = NAME_KINGDOM_BY_KEY[kingdomKey];

  return kingdomName
    ? `homeInitial.kingdoms.cardDescriptions.${kingdomName}`
    : null;
};

const WelcomeSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const runSearch = useCallback(
    (value: string) => {
      const q = value.trim();
      if (!q) return;

      void navigate({
        to: "/search/$query",
        params: { query: q },
      });
    },
    [navigate],
  );

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      runSearch(query);
    },
    [query, runSearch],
  );

  const openPopularSpecies = useCallback(
    (species: (typeof POPULAR_SEARCHES)[number]) => {
      const speciesSlug = getSpeciesSlugParam(species.gbifKey, species.name);
      if (!speciesSlug) return;

      void navigate({
        to: "/species/$speciesSlug",
        params: { speciesSlug },
      });
    },
    [navigate],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full @[900px]/welcome:max-w-md @[1120px]/welcome:max-w-136"
    >
      <div className="border-border bg-card flex h-12 items-center gap-2 rounded-lg border px-3">
        <Search className="text-muted-foreground size-4 shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("homeInitial.searchPlaceholder")}
          className="placeholder:text-muted-foreground text-foreground min-w-0 flex-1 text-sm outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {t("homeInitial.popularSearches")}:
        </span>
        {POPULAR_SEARCHES.map((species) => (
          <Button
            key={species.gbifKey}
            type="button"
            onClick={() => openPopularSpecies(species)}
            variant="outline"
            className="h-auto min-h-6 rounded-sm px-2 py-1 text-left text-xs whitespace-normal"
          >
            {species.name}
          </Button>
        ))}
      </div>
    </form>
  );
};

const WelcomePanel = () => {
  const { t } = useTranslation();

  return (
    <section className="@container/welcome">
      <header className="flex flex-col gap-6 @[900px]/welcome:flex-row @[900px]/welcome:items-start @[900px]/welcome:justify-between">
        <div className="max-w-xl space-y-2">
          <h1 className="text-2xl leading-tight font-semibold tracking-tight @[560px]/welcome:text-3xl @[1120px]/welcome:text-4xl">
            {t("homeInitial.heroTitle")}
          </h1>
        </div>
        <WelcomeSearch />
      </header>
    </section>
  );
};

const KingdomsSection = () => {
  const { t } = useTranslation();
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const { navigateToNodes, toggleNode } = useTreeNavigation();
  const scrollThenNavigate = useScrollThenNavigate();
  const [activeKingdomKey, setActiveKingdomKey] = useState(
    DEFAULT_EXPANDED_KINGDOM_KEY,
  );

  const selectKingdom = useCallback(
    (kingdomKey: number) => {
      scrollThenNavigate(() => toggleNode(kingdomKey));
    },
    [scrollThenNavigate, toggleNode],
  );

  const selectGroup = useCallback(
    (pathNode: PathNode[]) => {
      scrollThenNavigate(() => navigateToNodes(pathNode));
    },
    [navigateToNodes, scrollThenNavigate],
  );

  const activateKingdom = useCallback(
    (kingdomKey: number) => setActiveKingdomKey(kingdomKey),
    [],
  );

  if (!exploreInfos?.length) return null;

  const kingdomLabel = t("explore.kingdom");
  const mainGroupsLabel = t("explore.mainGroups");
  const effectiveActiveKingdomKey = exploreInfos.some(
    (item) => item.kingdomKey === activeKingdomKey,
  )
    ? activeKingdomKey
    : exploreInfos[0].kingdomKey;

  return (
    <section className="@container/kingdoms space-y-3">
      <div className="text-foreground max-w-3xl py-3">
        <h2 className="text-lg font-bold">{t("homeInitial.kingdoms.title")}</h2>
        <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
          {t("homeInitial.kingdoms.description")}
        </p>
      </div>

      <div className="flex flex-col @[620px]/kingdoms:h-88 @[620px]/kingdoms:flex-row">
        {exploreInfos.map((item) => {
          const active = effectiveActiveKingdomKey === item.kingdomKey;
          const descriptionKey = getKingdomCardDescriptionKey(item.kingdomKey);

          return (
            <KingdomCardItem
              key={item.kingdomKey}
              item={item}
              active={active}
              kingdomLabel={kingdomLabel}
              mainGroupsLabel={mainGroupsLabel}
              description={
                descriptionKey
                  ? t(descriptionKey, { defaultValue: item.description })
                  : item.description
              }
              onActivate={activateKingdom}
              onSelect={selectKingdom}
              onGroupSelect={selectGroup}
              className={
                active
                  ? "h-72 @[620px]/kingdoms:h-full @[620px]/kingdoms:flex-[3.6]"
                  : "h-19 @[620px]/kingdoms:h-full @[620px]/kingdoms:flex-1"
              }
            />
          );
        })}
      </div>
    </section>
  );
};

const FeaturedListsHomeSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);
  const [createOpen, setCreateOpen] = useState(false);
  const { data: featuredLists = [], isLoading } = useGetFeaturedLists();

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }

    setCreateOpen(true);
  };

  const handleListCreated = (_listId: string, title: string) => {
    setCreateOpen(false);
    if (userDb?.username) {
      void navigate({
        to: "/$username/lists/$listSlug",
        params: { username: userDb.username, listSlug: slugify(title) },
      });
    }
  };

  return (
    <section className="@container/featured space-y-3">
      <div className="flex flex-col items-start gap-3 @[520px]/featured:flex-row @[520px]/featured:items-center @[520px]/featured:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-foreground text-xl font-bold">
            {t("homeInitial.featuredLists.title")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t("homeInitial.featuredLists.description")}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 @[520px]/featured:w-auto @[520px]/featured:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void navigate({ to: "/lists" })}
            className="w-full @[520px]/featured:w-auto"
          >
            {t("homeInitial.featuredLists.viewAll")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCreateClick}
            className="w-full @[520px]/featured:w-auto"
          >
            {t("homeInitial.featuredLists.create")}
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-3">
          <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
            {t("lists.featuredLists")}
          </span>
        </div>

        <div className="grid gap-2 @[720px]/featured:grid-cols-2 @[1080px]/featured:grid-cols-3">
          {isLoading
            ? FEATURED_LIST_SKELETON_KEYS.map((index) => (
                <div
                  key={index}
                  className="border-border h-20 animate-pulse rounded-lg border"
                />
              ))
            : featuredLists.map((list) => (
                <FeaturedListCard key={list.id} list={list} />
              ))}
        </div>

        {!isLoading && featuredLists.length === 0 && (
          <p className="text-muted-foreground px-2 py-8 text-center text-sm">
            {t("homeInitial.featuredLists.empty")}
          </p>
        )}
      </div>

      <ListCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleListCreated}
      />
    </section>
  );
};

const DailyChallengeHomeSection = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(authStore.isAuthenticated);
  const userDb = useAtomValue(authStore.userDb);
  const currentChallenge = useAtomValue(treeAtom.challenge);
  const setChallenge = useSetAtom(treeAtom.challenge);
  const today = getLocalDateKey();
  const [selectedDate, setSelectedDate] = useState(
    () => currentChallenge.challengeDate ?? today,
  );

  const { data: challengeDates = [] } = useGetChallengeDates();
  const { data, isLoading, isError } = useGetDailyChallenge(selectedDate);
  const currentChallengeDate = useMemo(
    () =>
      challengeDates.find(
        (challengeDate) => challengeDate.date === selectedDate,
      ),
    [challengeDates, selectedDate],
  );

  const isToday = selectedDate === today;
  const isCompleted = currentChallengeDate?.completed ?? false;
  const currentStreak = useMemo(
    () => (isAuthenticated ? calcDailyStreak(challengeDates) : 0),
    [challengeDates, isAuthenticated],
  );
  const recordStreak = isAuthenticated
    ? Math.max(
        currentStreak,
        userDb?.game_info?.progress?.consecutive_days ?? 0,
      )
    : 0;
  const pastChallengesLabel = t("challenge.pastChallenges");

  const formattedSelectedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${selectedDate}T00:00:00`)),
    [i18n.language, selectedDate],
  );

  const speciesName = data?.scientificName;

  const handleStart = () => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }

    if (!data) return;

    setChallenge({
      mode: "DAILY",
      status: "IN_PROGRESS",
      targetSpecies: data.scientificName,
      speciesKey: data.gbifKey,
      challengeDate: selectedDate,
      startedAt: Date.now(),
      errorTracking: { count: 0, perStep: [] },
      stepInteractions: {},
    });
  };

  return (
    <section className="text-foreground @container/daily py-3">
      <div className="mb-5 flex flex-col items-start gap-3 @[760px]/daily:flex-row @[760px]/daily:justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {t("homeInitial.dailyChallenge.title")}
          </h2>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
            {t("homeInitial.dailyChallenge.description")}
          </p>
        </div>

        <ChallengeDatePicker
          selectedDate={selectedDate}
          challengeDates={challengeDates}
          onSelectDate={setSelectedDate}
          formattedLabel={pastChallengesLabel}
          triggerContent={
            <>
              <CalendarDays className="size-3.5" />
              <span>{pastChallengesLabel}</span>
            </>
          }
          triggerClassName="h-8 shrink-0 border border-border bg-transparent px-3 text-xs text-muted-foreground shadow-none hover:text-foreground"
        />
      </div>

      <div className="border-border bg-card rounded-xl border p-4 @[640px]/daily:p-6">
        <div className="flex flex-col gap-5 @[920px]/daily:flex-row @[920px]/daily:items-center @[920px]/daily:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="border-border text-muted-foreground rounded-md border px-3 py-1 text-xs font-bold">
                {t("homeInitial.dailyChallenge.badge")}
              </span>
              <span className="text-muted-foreground text-sm">
                {formattedSelectedDate}
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  {t("challenge.alreadyCompleted")}
                </span>
              )}
              {isToday && <Timer />}
            </div>

            <h3 className="text-foreground text-xl leading-tight font-bold @[640px]/daily:text-2xl">
              {t("homeInitial.dailyChallenge.findPathPrefix")}{" "}
              {isLoading ? (
                <span className="text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  {t("homeInitial.dailyChallenge.loadingSpecies")}
                </span>
              ) : isError || !speciesName ? (
                <span className="text-muted-foreground">
                  {t("homeInitial.dailyChallenge.surpriseSpecies")}
                </span>
              ) : (
                <span className="font-semibold text-emerald-600">
                  {speciesName}
                </span>
              )}
            </h3>

            <p className="text-muted-foreground mt-3 text-sm">
              {isAuthenticated
                ? t("homeInitial.dailyChallenge.authenticatedHint")
                : t("homeInitial.dailyChallenge.guestHint")}
            </p>

            {isAuthenticated && (
              <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span>
                  {t("homeInitial.dailyChallenge.currentStreak")}:{" "}
                  <strong className="text-foreground">
                    {currentStreak} {t("challenge.statsDays")}
                  </strong>
                </span>
                <span className="text-border hidden @[420px]/daily:inline">
                  |
                </span>
                <span>
                  {t("homeInitial.dailyChallenge.recordStreak")}:{" "}
                  <strong className="text-foreground">
                    {recordStreak} {t("challenge.statsDays")}
                  </strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 @[520px]/daily:min-w-48">
            <Button
              onClick={handleStart}
              disabled={isLoading || isError || !data}
              className="h-11 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Play className="size-4" />
              {isCompleted ? t("challenge.play") : t("challenge.start")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => void navigate({ to: "/challenges" })}
              className="h-9"
            >
              <HelpCircle className="size-4" />
              {t("homeInitial.dailyChallenge.howItWorks")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// const FeedbackSection = () => (
//   <section className="text-muted-foreground @container/feedback mt-12 flex flex-col gap-5 border-t py-12 @[680px]/feedback:flex-row @[680px]/feedback:items-center @[680px]/feedback:justify-between">
//     <div>
//       <h2 className="text-foreground text-xl font-semibold">
//         Contribua com o Treevera
//       </h2>
//       <p className="mt-2 text-base">
//         Envie feedbacks, sugira melhorias e ajude a evoluir o projeto.
//       </p>
//     </div>
//
//     <Button
//       asChild
//       variant="outline"
//       className="h-11 w-full bg-transparent px-8 text-base @[680px]/feedback:w-auto"
//     >
//       <a href="mailto:feedback@treevera.app?subject=Feedback%20Treevera">
//         <MessageSquare className="size-4" />
//         Feedback
//       </a>
//     </Button>
//   </section>
// );

export const HomeInitialPanel = () => (
  <main className="text-foreground @container/home-initial mb-42 min-h-screen min-w-0 overflow-x-hidden bg-transparent px-6 py-6">
    <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-10 @[860px]/home-initial:gap-12">
      <WelcomePanel />

      <KingdomsSection />

      <FeaturedListsHomeSection />

      <DailyChallengeHomeSection />

      {/* <FeedbackSection /> */}
    </div>
  </main>
);
