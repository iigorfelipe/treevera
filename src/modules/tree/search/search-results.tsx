import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";

import { capitalizar } from "@/common/utils/string";
import { getRankIcon } from "@/common/utils/tree/ranks";
import { KEY_KINGDOM_BY_NAME } from "@/common/constants/tree";
import { Image } from "@/common/components/image";
import type { Taxon } from "@/common/types/api";

const OFFICIAL_KINGDOMS = [
  "animalia",
  "archaea",
  "bacteria",
  "chromista",
  "fungi",
  "plantae",
  "protozoa",
];

interface SearchResultsProps {
  results: Taxon[];
  selected: Taxon | null;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  onPick: (taxon: Taxon) => Promise<void>;
}

export function SearchResults({
  results,
  selected,
  minimized,
  setMinimized,
  onPick,
}: SearchResultsProps) {
  const handlePick = async (taxon: Taxon) => {
    await onPick(taxon);
    setMinimized(true);
  };
  const { t } = useTranslation();

  const groupedByKingdom = useMemo(() => {
    const map = new Map<string, Taxon[]>();
    for (const r of results) {
      const k = String(r.kingdom ?? "unknown").toLowerCase();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return map;
  }, [results]);

  const sortedKingdomEntries = useMemo(() => {
    const entries = Array.from(groupedByKingdom.entries());
    return entries.sort(([a], [b]) => {
      const ai = OFFICIAL_KINGDOMS.indexOf(a);
      const bi = OFFICIAL_KINGDOMS.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedByKingdom]);

  const isMultiKingdom = groupedByKingdom.size > 1;

  const breadcrumb = (r: Taxon) => {
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
      .join(" › ");
  };

  const renderItem = (r: Taxon) => (
    <button
      onClick={() => handlePick(r)}
      className={`hover:bg-accent w-full cursor-pointer px-3 py-2 text-left transition-colors ${
        selected?.key === r.key ? "bg-muted" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium italic">
            {r.canonicalName || r.scientificName}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {breadcrumb(r)}
          </p>
        </div>
        <span className="text-muted-foreground mt-0.5 shrink-0 text-xs">
          {r.rank}
        </span>
      </div>
    </button>
  );

  const headerLabel =
    minimized && selected
      ? selected.canonicalName || selected.scientificName
      : results.length === 0
        ? t("search.noResults")
        : `${results.length} ${t("search.results")}`;

  return (
    <div className="bg-card mt-2 overflow-hidden rounded-lg border shadow-sm">
      <button
        onClick={() => setMinimized(!minimized)}
        className="flex w-full cursor-pointer items-center justify-between px-3 py-2"
        aria-label={
          minimized ? t("search.expandResults") : t("search.minimizeResults")
        }
      >
        <span
          className={`truncate text-xs font-medium ${minimized && selected ? "italic" : "text-muted-foreground"}`}
        >
          {headerLabel}
        </span>
        {minimized ? (
          <ChevronDown className="text-muted-foreground ml-2 size-3.5 shrink-0" />
        ) : (
          <ChevronUp className="text-muted-foreground ml-2 size-3.5 shrink-0" />
        )}
      </button>

      {!minimized && results.length > 0 && (
        <div className="max-h-64 overflow-auto">
          {isMultiKingdom ? (
            sortedKingdomEntries.map(([kingdom, group]) => {
              const kingdomKey =
                KEY_KINGDOM_BY_NAME[
                  kingdom as keyof typeof KEY_KINGDOM_BY_NAME
                ] ?? 0;
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
                      <li key={r.key}>{renderItem(r)}</li>
                    ))}
                  </ul>
                </div>
              );
            })
          ) : (
            <ul className="divide-y">
              {results.map((r) => (
                <li key={r.key}>{renderItem(r)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!minimized && results.length === 0 && (
        <p className="text-muted-foreground px-3 pb-3 text-sm">
          {t("search.noResults")}
        </p>
      )}
    </div>
  );
}
