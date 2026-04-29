import { useMemo, useState, type ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, List, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { searchTaxaByUserQuery } from "@/services/apis/species-search";
import { fetchPublicLists } from "@/common/utils/supabase/lists";
import { searchUsers } from "@/common/utils/supabase/search";
import { processTaxaResults } from "@/common/utils/tree/search-taxa";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { capitalizar } from "@/common/utils/string";
import { getRankIcon } from "@/common/utils/tree/ranks";
import { KEY_KINGDOM_BY_NAME } from "@/common/constants/tree";
import { Image } from "@/common/components/image";
import { inatImageUrl } from "@/common/utils/image-size";
import { Skeleton } from "@/common/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useNavigateToTaxon } from "@/hooks/use-navigate-to-taxon";
import type { Taxon } from "@/common/types/api";
import type { ListWithCreator } from "@/common/types/lists";
import type { UserSearchResult } from "@/common/utils/supabase/search";
import {
  SearchFilter,
  type SearchFilterValue,
} from "@/modules/tree/search/search-filter";
import { getListSlugParam } from "@/common/utils/list-url";

const OFFICIAL_KINGDOMS = [
  "animalia",
  "archaea",
  "bacteria",
  "chromista",
  "fungi",
  "plantae",
  "protozoa",
];

type Filter = "all" | "tree" | "lists" | "users";

const FILTER_OPTIONS: Array<{ value: Filter; labelKey: string }> = [
  { value: "all", labelKey: "search.filterAll" },
  { value: "tree", labelKey: "search.taxonomicTree" },
  { value: "lists", labelKey: "lists.title" },
  { value: "users", labelKey: "search.users" },
];

function breadcrumb(r: Taxon) {
  const d = r as unknown as Record<string, unknown>;

  return [
    r.kingdom && capitalizar(String(r.kingdom)),
    r.phylum && capitalizar(String(r.phylum)),
    (d["class"] as string | undefined) && capitalizar(String(d["class"])),
    r.order && capitalizar(String(r.order)),
    r.family && capitalizar(String(r.family)),
    r.genus && capitalizar(String(r.genus)),
  ]
    .filter(Boolean)
    .join(" > ");
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="size-8 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function SectionSkeletons() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

function TaxonItem({
  taxon,
  onPick,
}: {
  taxon: Taxon;
  onPick: (t: Taxon) => void;
}) {
  return (
    <button
      onClick={() => onPick(taxon)}
      className="hover:bg-accent w-full cursor-pointer px-3 py-2 text-left transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium italic">
            {taxon.canonicalName || taxon.scientificName}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {breadcrumb(taxon)}
          </p>
        </div>
        <span className="text-muted-foreground mt-0.5 shrink-0 text-xs">
          {taxon.rank}
        </span>
      </div>
    </button>
  );
}

function TaxaResults({ taxa }: { taxa: Taxon[] }) {
  const { t } = useTranslation();
  const { navigateToTaxon } = useNavigateToTaxon();

  const groupedByKingdom = useMemo(() => {
    const map = new Map<string, Taxon[]>();

    for (const r of taxa) {
      const kingdom = String(r.kingdom ?? "unknown").toLowerCase();

      if (!map.has(kingdom)) {
        map.set(kingdom, []);
      }

      map.get(kingdom)?.push(r);
    }

    return map;
  }, [taxa]);

  const sortedEntries = useMemo(() => {
    return Array.from(groupedByKingdom.entries()).sort(([a], [b]) => {
      const ai = OFFICIAL_KINGDOMS.indexOf(a);
      const bi = OFFICIAL_KINGDOMS.indexOf(b);

      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;

      return a.localeCompare(b);
    });
  }, [groupedByKingdom]);

  if (groupedByKingdom.size > 1) {
    return (
      <>
        {sortedEntries.map(([kingdom, group]) => {
          const kingdomKey =
            KEY_KINGDOM_BY_NAME[kingdom as keyof typeof KEY_KINGDOM_BY_NAME] ??
            0;

          return (
            <div key={kingdom}>
              <div className="bg-muted/50 flex items-center gap-1.5 border-y px-3 py-1.5">
                {kingdomKey > 0 && (
                  <Image
                    src={getRankIcon(kingdomKey)}
                    alt={kingdom}
                    className="size-4"
                  />
                )}
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {kingdom === "unknown"
                    ? t("search.unknownKingdom")
                    : capitalizar(kingdom)}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({group.length})
                </span>
              </div>
              <ul className="divide-y">
                {group.map((r) => (
                  <li key={r.key}>
                    <TaxonItem taxon={r} onPick={navigateToTaxon} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <ul className="divide-y">
      {taxa.map((r) => (
        <li key={r.key}>
          <TaxonItem taxon={r} onPick={navigateToTaxon} />
        </li>
      ))}
    </ul>
  );
}

function ListRow({ list }: { list: ListWithCreator }) {
  const { t } = useTranslation();
  const listSlug = getListSlugParam(list.title);

  return (
    <Link
      to="/$username/lists/$listSlug"
      params={{ username: list.user_username, listSlug }}
      className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors"
    >
      <div className="bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {list.cover_image_url ? (
          <Image
            src={inatImageUrl(list.cover_image_url, "small")}
            alt={list.title}
            className="size-full object-cover"
          />
        ) : (
          <List className="text-muted-foreground size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{list.title}</p>
        <p className="text-muted-foreground text-xs">
          @{list.user_username} {"\u00b7"} {list.species_count}{" "}
          {t("lists.species")} {"\u00b7"} {"\u2665"} {list.likes_count}
        </p>
      </div>
      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
    </Link>
  );
}

function UserRow({ user }: { user: UserSearchResult }) {
  return (
    <Link
      to="/$username"
      params={{ username: user.username }}
      className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors"
    >
      <div className="bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            className="size-full object-cover"
          />
        ) : (
          <User className="text-muted-foreground size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">@{user.username}</p>
        {user.name && (
          <p className="text-muted-foreground truncate text-xs">{user.name}</p>
        )}
      </div>
      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
    </Link>
  );
}

function Section({
  title,
  count,
  loading,
  headerAction,
  empty,
  emptyHint,
  contentClassName,
  children,
}: {
  title: string;
  count: number;
  loading: boolean;
  headerAction?: ReactNode;
  empty: boolean;
  emptyHint?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-3">
        <span className="text-xs font-semibold tracking-[0.18em] uppercase">
          {title}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {headerAction}
          {!loading && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {count} {t(count === 1 ? "search.result" : "search.results")}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <SectionSkeletons />
      ) : empty ? (
        <div className="px-4 py-6 text-center">
          <p className="text-muted-foreground text-sm">
            {t("search.noResults")}
          </p>
          {emptyHint}
        </div>
      ) : (
        <div className={`divide-y ${contentClassName ?? ""}`}>{children}</div>
      )}
    </div>
  );
}

export function SearchResultsPage({ query }: { query: string }) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");
  const [taxonomicFilter, setTaxonomicFilter] = useState<SearchFilterValue>({
    kingdom: "",
    rank: "",
  });

  const decoded = query;
  const activeKingdom = taxonomicFilter.kingdom;
  const activeRank = taxonomicFilter.rank;
  const language = i18n.resolvedLanguage ?? i18n.language;
  const hyphenSuggestion = useMemo(() => {
    if (activeRank !== "SPECIES") return null;

    const trimmed = decoded.trim();
    if (!/\s/.test(trimmed)) return null;

    const suggestion = trimmed.replace(/\s+/g, "-");
    return suggestion !== trimmed ? suggestion : null;
  }, [activeRank, decoded]);

  const [taxaQuery, listsQuery, usersQuery] = useQueries({
    queries: [
      {
        queryKey: [
          QUERY_KEYS.search_taxa_key,
          decoded,
          activeKingdom,
          activeRank,
          language,
        ],
        queryFn: () =>
          searchTaxaByUserQuery(
            decoded,
            activeKingdom || undefined,
            activeRank || undefined,
            language,
          ),
        enabled: decoded.length > 0,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: [QUERY_KEYS.search_lists_key, decoded],
        queryFn: () => fetchPublicLists(20, 0, "popular", decoded),
        enabled: decoded.length > 0,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: [QUERY_KEYS.search_users_key, decoded],
        queryFn: () => searchUsers(decoded),
        enabled: decoded.length > 0,
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const taxa = processTaxaResults(
    (taxaQuery.data as Taxon[]) ?? [],
    decoded,
    activeRank || undefined,
    activeKingdom || undefined,
  );
  const lists = listsQuery.data?.rows ?? [];
  const users = usersQuery.data ?? [];

  const anyLoading =
    taxaQuery.isLoading || listsQuery.isLoading || usersQuery.isLoading;

  type SectionDef = {
    key: Filter;
    title: string;
    count: number;
    loading: boolean;
    headerAction?: ReactNode;
    emptyHint?: ReactNode;
    contentClassName?: string;
    children: ReactNode;
  };

  const allSections: SectionDef[] = [
    {
      key: "tree",
      title: t("search.taxonomicTree"),
      count: taxa.length,
      loading: taxaQuery.isLoading,
      headerAction: (
        <SearchFilter value={taxonomicFilter} onChange={setTaxonomicFilter} />
      ),
      contentClassName: "max-h-[32rem] overflow-y-auto",
      emptyHint: hyphenSuggestion ? (
        <p className="text-muted-foreground/80 mx-auto mt-1 max-w-sm text-xs">
          {t("search.hyphenSuggestion", { term: hyphenSuggestion })}
        </p>
      ) : null,
      children: <TaxaResults taxa={taxa} />,
    },
    {
      key: "lists",
      title: t("lists.title"),
      count: lists.length,
      loading: listsQuery.isLoading,
      children: lists.map((list) => <ListRow key={list.id} list={list} />),
    },
    {
      key: "users",
      title: t("search.users"),
      count: users.length,
      loading: usersQuery.isLoading,
      children: users.map((user) => <UserRow key={user.id} user={user} />),
    },
  ];

  const sections = anyLoading
    ? allSections
    : [
        ...allSections.filter((section) => section.count > 0),
        ...allSections.filter((section) => section.count === 0),
      ];

  const visible = sections.filter(
    (section) => filter === "all" || filter === section.key,
  );

  return (
    <div className="mx-auto max-w-7xl py-4">
      <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-baseline gap-2">
          <p className="text-muted-foreground shrink-0 text-sm">
            {t("search.resultsFor")}
          </p>
          <h1 className="truncate text-xl font-bold">"{decoded}"</h1>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as Filter)}
          >
            <SelectTrigger className="w-full rounded-lg font-medium sm:w-60">
              <SelectValue placeholder={t("search.filterAll")} />
            </SelectTrigger>
            <SelectContent className="rounded-lg text-sm font-medium">
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <hr className="border-border mb-8" />

      <div className="flex flex-col gap-6">
        {visible.map((section) => (
          <Section
            key={section.key}
            title={section.title}
            count={section.count}
            loading={section.loading}
            headerAction={section.headerAction}
            empty={!section.loading && section.count === 0}
            emptyHint={section.emptyHint}
            contentClassName={section.contentClassName}
          >
            {section.children}
          </Section>
        ))}
      </div>
    </div>
  );
}
