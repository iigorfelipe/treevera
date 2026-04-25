import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  CheckCircle2,
  // Compass,
  HelpCircle,
  Loader2,
  MessageSquare,
  // MousePointer2,
  Play,
  Search,
} from "lucide-react";

import { Button } from "@/common/components/ui/button";
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

const SectionIntro = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("text-foreground px-3 py-3", className)}>
    <h2 className="text-lg font-bold">{title}</h2>
    <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
      {children}
    </p>
  </div>
);

// const WelcomeStep = ({
//   icon,
//   title,
//   children,
// }: {
//   icon: ReactNode;
//   title: string;
//   children: ReactNode;
// }) => (
//   <div className="border-border bg-card rounded-lg border p-4">
//     <div className="flex min-w-0 items-center gap-2">
//       <span className="text-muted-foreground">{icon}</span>
//       <h3 className="text-foreground text-sm font-bold">{title}</h3>
//     </div>
//     <p className="text-muted-foreground mt-3 text-sm leading-6">{children}</p>
//   </div>
// );

const WelcomeSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const runSearch = (value: string) => {
    const q = value.trim();
    if (!q) return;

    void navigate({
      to: "/search/$query",
      params: { query: encodeURIComponent(q) },
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    runSearch(query);
  };

  const examples = ["Panthera onca", "Gorilla gorilla", "Tyrannosaurus rex"];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-1/2">
      <div className="border-border bg-card flex h-12 items-center gap-2 rounded-lg border px-3">
        <Search className="text-muted-foreground size-4 shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquise em todo o site (espécies, listas, usuários)"
          className="placeholder:text-muted-foreground text-foreground min-w-0 flex-1 text-sm outline-none"
        />
      </div>

      {/* <p className="text-muted-foreground mt-3 text-sm">
        Para filtrar apenas a árvore taxonômica, use o campo de busca acima
        dela.
      </p> */}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs">Buscas populares:</span>
        {examples.map((example) => (
          <Button
            key={example}
            type="button"
            onClick={() => runSearch(example)}
            variant="outline"
            className="h-6 rounded-sm px-1 text-xs"
          >
            {example}
          </Button>
        ))}
      </div>
    </form>
  );
};

const WelcomePanel = () => (
  <section>
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
          Encontre qualquer ser vivo já catalogado, das bactérias às baleias.
        </h1>
      </div>
      <WelcomeSearch />
    </header>

    {/* <div className="mt-16 grid gap-3 lg:grid-cols-3">
      <WelcomeStep
        icon={<MousePointer2 className="size-4" />}
        title="Use a árvore à esquerda"
      >
        Clique em qualquer item para expandir e ver os grupos que ele contém.
      </WelcomeStep>

      <WelcomeStep
        icon={<Compass className="size-4" />}
        title="Ou comece por um reino"
      >
        Os 7 grandes grupos da vida estão logo abaixo. Escolha um para começar.
      </WelcomeStep>

      <WelcomeStep icon={<Search className="size-4" />} title="Pesquise direto">
        Sabe o que procura? Use a busca acima por nome popular ou científico.
      </WelcomeStep>
    </div> */}
  </section>
);

const KingdomsSection = () => {
  const { t } = useTranslation();
  const exploreInfos = useAtomValue(treeAtom.exploreInfos);
  const { toggleNode } = useTreeNavigation();
  const scrollThenNavigate = useScrollThenNavigate();

  if (!exploreInfos) return null;

  const selectKingdom = (kingdomKey: number) => {
    scrollThenNavigate(() => toggleNode(kingdomKey));
  };

  return (
    <section className="@container/kingdoms space-y-3">
      <SectionIntro title="Inicie por um reino" className="max-w-3xl">
        Toda forma de vida pertence a um destes 7 grupos. Escolha um para
        expandir a árvore a partir dele.
      </SectionIntro>

      <div className="grid @[640px]/kingdoms:grid-cols-3 @[980px]/kingdoms:grid-cols-4">
        {exploreInfos.map((item) => (
          <KingdomCardItem
            key={item.kingdomKey}
            item={item}
            kingdomLabel={t("explore.kingdom")}
            onSelect={() => selectKingdom(item.kingdomKey)}
            className="h-full"
          />
        ))}
      </div>
    </section>
  );
};

const FeaturedListsHomeSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: featuredLists = [], isLoading } = useGetFeaturedLists();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-foreground text-xl font-bold">
          Explore através de listas
        </h2>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void navigate({ to: "/lists" })}
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

        <div className="grid gap-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
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
  const currentChallengeDate = challengeDates.find(
    (challengeDate) => challengeDate.date === selectedDate,
  );

  const isToday = selectedDate === today;
  const isCompleted = currentChallengeDate?.completed ?? false;
  const currentStreak = useMemo(
    () => calcDailyStreak(challengeDates),
    [challengeDates],
  );
  const recordStreak = Math.max(
    currentStreak,
    userDb?.game_info?.progress?.consecutive_days ?? 0,
  );

  const formattedSelectedDate = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${selectedDate}T00:00:00`));

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
    <section className="text-foreground px-3 py-3">
      <div className="mb-5 flex items-start justify-between gap-4">
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
          formattedLabel={t("challenge.pastChallenges")}
          triggerContent={
            <>
              <CalendarDays className="size-3.5" />
              <span>{t("challenge.pastChallenges")}</span>
            </>
          }
          triggerClassName="h-8 shrink-0 border border-border bg-transparent px-3 text-xs text-muted-foreground shadow-none hover:text-foreground"
        />
      </div>

      <div className="border-border bg-card rounded-xl border p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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

            <h3 className="text-foreground text-2xl leading-tight font-bold">
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
                <span className="text-border hidden sm:inline">|</span>
                <span>
                  Recorde:{" "}
                  <strong className="text-foreground">
                    {recordStreak} dias
                  </strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:min-w-48">
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

const FeedbackSection = () => (
  <section className="text-muted-foreground mt-12 flex flex-col gap-5 border-t py-12 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-foreground text-xl font-semibold">
        Contribua com o Treevera
      </h2>
      <p className="mt-2 text-base">
        Envie feedbacks, sugira melhorias e ajude a evoluir o projeto.
      </p>
    </div>

    <Button
      asChild
      variant="outline"
      className="h-11 bg-transparent px-8 text-base"
    >
      <a href="mailto:feedback@treevera.app?subject=Feedback%20Treevera">
        <MessageSquare className="size-4" />
        Feedback
      </a>
    </Button>
  </section>
);

export const HomeInitialPanel = () => (
  <main className="text-foreground mt-6 min-h-screen bg-transparent px-6 py-7 md:px-8">
    <div className="mx-auto flex max-w-7xl flex-col gap-12">
      <WelcomePanel />

      <KingdomsSection />

      <FeaturedListsHomeSection />

      <DailyChallengeHomeSection />

      <FeedbackSection />
    </div>
  </main>
);
