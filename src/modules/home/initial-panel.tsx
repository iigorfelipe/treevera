import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { LayoutGroup } from "framer-motion";
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
import type { PathNode } from "@/common/types/tree-atoms";
import { cn } from "@/common/utils/cn";
import { ChallengeDatePicker } from "@/modules/challenge/daily/challenge-date-picker";
import { Timer } from "@/modules/challenge/components/timer";
import { FeaturedListCard } from "@/modules/lists/featured-list-card";
import { KingdomCardItem } from "@/modules/explore/kingdom-card";
import { useGetChallengeDates } from "@/hooks/queries/useGetChallengeDates";
import { useGetDailyChallenge } from "@/hooks/queries/useGetDailyChallenge";
import { useGetFeaturedLists } from "@/hooks/queries/useGetLists";
import { useScrollThenNavigate } from "@/hooks/use-scroll-then-navigate";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import { authStore } from "@/store/auth/atoms";
import { treeAtom } from "@/store/tree";

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

const getKingdomGridColumns = (width: number) => {
  if (width >= 1080) return 4;
  if (width >= 700) return 3;
  return 1;
};

const POPULAR_SEARCHES = [
  "Panthera onca",
  "Gorilla gorilla",
  "Tyrannosaurus rex",
];

const FEATURED_LIST_SKELETON_KEYS = [0, 1, 2];

const RELEASE_GRID_HEIGHT_DELAY = 260;

const WelcomeSearch = () => {
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
          placeholder="Pesquise em todo o site (espécies, listas, usuários)"
          className="placeholder:text-muted-foreground text-foreground min-w-0 flex-1 text-sm outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">Buscas populares:</span>
        {POPULAR_SEARCHES.map((example) => (
          <Button
            key={example}
            type="button"
            onClick={() => runSearch(example)}
            variant="outline"
            className="h-auto min-h-6 rounded-sm px-2 py-1 text-left text-xs whitespace-normal"
          >
            {example}
          </Button>
        ))}
      </div>
    </form>
  );
};

const WelcomePanel = () => (
  <section className="@container/welcome">
    <header className="flex flex-col gap-6 @[900px]/welcome:flex-row @[900px]/welcome:items-start @[900px]/welcome:justify-between">
      <div className="max-w-xl space-y-2">
        <h1 className="text-2xl leading-tight font-semibold tracking-tight @[560px]/welcome:text-3xl @[1120px]/welcome:text-4xl">
          Encontre qualquer ser vivo já catalogado, das bactérias às baleias.
        </h1>
      </div>
      <WelcomeSearch />
    </header>
  </section>
);

const KingdomsSection = () => {
  const { t } = useTranslation();
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const { navigateToNodes, toggleNode } = useTreeNavigation();
  const scrollThenNavigate = useScrollThenNavigate();
  const [activeKingdomKey, setActiveKingdomKey] = useState<number | null>(null);
  const [lockedGridHeight, setLockedGridHeight] = useState<number | null>(null);
  const [gridColumns, setGridColumns] = useState(1);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const releaseHeightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const updateColumns = (width = element.getBoundingClientRect().width) => {
      setGridColumns(getKingdomGridColumns(width));
    };

    updateColumns();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      updateColumns(entry.contentRect.width);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (releaseHeightTimeoutRef.current) {
        window.clearTimeout(releaseHeightTimeoutRef.current);
      }
    },
    [],
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

  const setKingdomActive = useCallback(
    (kingdomKey: number, active: boolean) => {
      if (active) {
        if (releaseHeightTimeoutRef.current) {
          window.clearTimeout(releaseHeightTimeoutRef.current);
          releaseHeightTimeoutRef.current = null;
        }

        setLockedGridHeight((current) => {
          if (current) return current;
          return gridRef.current?.getBoundingClientRect().height ?? null;
        });
      }

      setActiveKingdomKey((current) => {
        if (active) return kingdomKey;
        return current === kingdomKey ? null : current;
      });
    },
    [],
  );

  const clearKingdomActive = useCallback(() => {
    setActiveKingdomKey(null);

    if (releaseHeightTimeoutRef.current) {
      window.clearTimeout(releaseHeightTimeoutRef.current);
    }

    releaseHeightTimeoutRef.current = window.setTimeout(() => {
      setLockedGridHeight(null);
      releaseHeightTimeoutRef.current = null;
    }, RELEASE_GRID_HEIGHT_DELAY);
  }, []);

  const focusedLayout = activeKingdomKey !== null && lockedGridHeight !== null;

  if (!exploreInfos) return null;

  const kingdomLabel = t("explore.kingdom");
  const mainGroupsLabel = t("explore.mainGroups");

  return (
    <section className="@container/kingdoms space-y-3">
      <div className="text-foreground max-w-3xl py-3">
        <h2 className="text-lg font-bold">Inicie por um reino</h2>
        <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
          Toda forma de vida pertence a um destes 7 grupos. Escolha um para
          expandir a árvore a partir dele.
        </p>
      </div>

      <LayoutGroup id="home-kingdoms">
        <div
          ref={gridRef}
          onMouseLeave={clearKingdomActive}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;
            if (nextTarget && event.currentTarget.contains(nextTarget as Node))
              return;
            clearKingdomActive();
          }}
          className={cn(
            "grid gap-2 overflow-hidden transition-[height] duration-300 ease-out",
            focusedLayout
              ? "auto-rows-fr @[700px]/kingdoms:grid-cols-3 @[1080px]/kingdoms:grid-cols-4"
              : "@[700px]/kingdoms:grid-cols-3 @[1080px]/kingdoms:grid-cols-4",
          )}
          style={lockedGridHeight ? { height: lockedGridHeight } : undefined}
        >
          {exploreInfos.map((item, index) => {
            const active = activeKingdomKey === item.kingdomKey;
            const compressed = focusedLayout && !active;
            const hasHorizontalRoom =
              gridColumns > 1 && index % gridColumns < gridColumns - 1;

            return (
              <KingdomCardItem
                key={item.kingdomKey}
                item={item}
                kingdomLabel={kingdomLabel}
                mainGroupsLabel={mainGroupsLabel}
                active={active}
                compressed={compressed}
                onActiveChange={setKingdomActive}
                onSelect={selectKingdom}
                onGroupSelect={selectGroup}
                className={cn(
                  "h-full",
                  focusedLayout
                    ? "min-h-0"
                    : "min-h-34 @[700px]/kingdoms:min-h-38",
                  active && focusedLayout && "row-span-3",
                  active &&
                    focusedLayout &&
                    hasHorizontalRoom &&
                    "@[700px]/kingdoms:col-span-2",
                )}
              />
            );
          })}
        </div>
      </LayoutGroup>
    </section>
  );
};

const FeaturedListsHomeSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: featuredLists = [], isLoading } = useGetFeaturedLists();

  return (
    <section className="@container/featured space-y-3">
      <div className="flex flex-col items-start gap-3 @[520px]/featured:flex-row @[520px]/featured:items-center @[520px]/featured:justify-between">
        <h2 className="text-foreground text-xl font-bold">
          Explore através de listas
        </h2>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void navigate({ to: "/lists" })}
          className="w-full @[520px]/featured:w-auto"
        >
          Ver todas as listas
        </Button>
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
            Nenhuma lista em destaque por enquanto.
          </p>
        )}
      </div>
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
          <h2 className="text-xl font-bold">Desafio do dia</h2>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
            Receba uma espécie por dia e descubra o caminho dela do reino até o
            nome científico. Bom para fixar a hierarquia.
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
                Desafio diário
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
              Encontre o caminho taxonômico de{" "}
              {isLoading ? (
                <span className="text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  carregando
                </span>
              ) : isError || !speciesName ? (
                <span className="text-muted-foreground">
                  uma espécie surpresa
                </span>
              ) : (
                <span className="font-semibold text-emerald-600">
                  {speciesName}
                </span>
              )}
            </h3>

            <p className="text-muted-foreground mt-3 text-sm">
              {isAuthenticated
                ? "Uma espécie nova por dia. Você tem até meia-noite para resolver e manter sua sequência."
                : "Uma espécie nova por dia."}
            </p>

            {isAuthenticated && (
              <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span>
                  Sequência atual:{" "}
                  <strong className="text-foreground">
                    {currentStreak} dias
                  </strong>
                </span>
                <span className="text-border hidden @[420px]/daily:inline">
                  |
                </span>
                <span>
                  Recorde:{" "}
                  <strong className="text-foreground">
                    {recordStreak} dias
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
              Como funciona
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
