import { useMemo, useState, type ReactNode } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, List, User } from "lucide-react";

import { searchTaxa } from "@/services/apis/gbif";
import { fetchPublicLists } from "@/common/utils/supabase/lists";
import { searchUsers } from "@/common/utils/supabase/search";
import { processTaxaResults } from "@/common/utils/tree/search-taxa";
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { capitalizar } from "@/common/utils/string";
import { getRankIcon } from "@/common/utils/tree/ranks";
import { KEY_KINGDOM_BY_NAME } from "@/common/constants/tree";
import { Image } from "@/common/components/image";
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

const FILTER_OPTIONS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "tree", label: "\u00c1rvore taxon\u00f4mica" },
  { value: "lists", label: "Listas" },
  { value: "users", label: "Usu\u00e1rios" },
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
                  {capitalizar(kingdom)}
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
  return (
    <Link
      to="/$username/lists/$listSlug"
      params={{ username: list.user_username, listSlug: list.slug }}
      className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors"
    >
      <div className="bg-muted flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {list.cover_image_url ? (
          <Image
            src={list.cover_image_url}
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
          @{list.user_username} {"\u00b7"} {list.species_count} esp\u00e9cies{" "}
          {"\u00b7"} {"\u2665"} {list.likes_count}
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
  empty,
  contentClassName,
  children,
}: {
  title: string;
  count: number;
  loading: boolean;
  empty: boolean;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-3">
        <span className="text-xs font-semibold tracking-[0.18em] uppercase">
          {title}
        </span>
        {!loading && (
          <span className="text-muted-foreground ml-auto text-xs">
            {count} resultado{count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <SectionSkeletons />
      ) : empty ? (
        <p className="text-muted-foreground px-4 py-6 text-center text-sm">
          Nenhum resultado
        </p>
      ) : (
        <div className={`divide-y ${contentClassName ?? ""}`}>{children}</div>
      )}
    </div>
  );
}

export function SearchResultsPage({ query }: { query: string }) {
  const [filter, setFilter] = useState<Filter>("all");

  const decoded = decodeURIComponent(query);

  const [taxaQuery, listsQuery, usersQuery] = useQueries({
    queries: [
      {
        queryKey: [QUERY_KEYS.search_taxa_key, decoded],
        queryFn: () => searchTaxa(decoded),
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

  const taxa = processTaxaResults((taxaQuery.data as Taxon[]) ?? [], decoded);
  const lists = listsQuery.data?.rows ?? [];
  const users = usersQuery.data ?? [];

  const anyLoading =
    taxaQuery.isLoading || listsQuery.isLoading || usersQuery.isLoading;

  type SectionDef = {
    key: Filter;
    title: string;
    count: number;
    loading: boolean;
    contentClassName?: string;
    children: ReactNode;
  };

  const allSections: SectionDef[] = [
    {
      key: "tree",
      title: "\u00c1rvore taxon\u00f4mica",
      count: taxa.length,
      loading: taxaQuery.isLoading,
      contentClassName: "max-h-[32rem] overflow-y-auto",
      children: <TaxaResults taxa={taxa} />,
    },
    {
      key: "lists",
      title: "Listas",
      count: lists.length,
      loading: listsQuery.isLoading,
      children: lists.map((list) => <ListRow key={list.id} list={list} />),
    },
    {
      key: "users",
      title: "Usu\u00e1rios",
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-baseline gap-2">
          <p className="text-muted-foreground shrink-0 text-sm">
            Resultados para
          </p>
          <h1 className="truncate text-xl font-bold">"{decoded}"</h1>
        </div>

        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        >
          <SelectTrigger className="w-full rounded-lg font-medium sm:w-60">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent className="rounded-lg text-sm font-medium">
            {FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <hr className="border-border mb-8" />

      <div className="flex flex-col gap-6">
        {visible.map((section) => (
          <Section
            key={section.key}
            title={section.title}
            count={section.count}
            loading={section.loading}
            empty={!section.loading && section.count === 0}
            contentClassName={section.contentClassName}
          >
            {section.children}
          </Section>
        ))}
      </div>
    </div>
  );
}
