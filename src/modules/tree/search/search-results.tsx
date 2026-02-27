import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";

import { capitalizar } from "@/common/utils/string";
import type { Taxon } from "@/common/types/api";

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
        <ul className="max-h-64 divide-y overflow-auto">
          {results.map((r) => (
            <li key={r.key}>
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
            </li>
          ))}
        </ul>
      )}

      {!minimized && results.length === 0 && (
        <p className="text-muted-foreground px-3 pb-3 text-sm">
          {t("search.noResults")}
        </p>
      )}
    </div>
  );
}
