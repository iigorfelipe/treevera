import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Loader, SearchIcon, X } from "lucide-react";

import type { Rank } from "@/common/types/api";

import { SearchFilter } from "./search-filter";
import {
  useAnimatedPlaceholder,
  SUGGESTIONS_BY_KINGDOM,
} from "./use-animated-placeholder";

interface SearchFormProps {
  q: string;
  setQ: (v: string) => void;
  kingdom: string;
  setKingdom: (v: string) => void;
  rank: Rank | "";
  setRank: (v: Rank | "") => void;
  loading: boolean;
  isKeySearch: boolean;
  hasResults: boolean;
  onSearch: (ev?: React.FormEvent) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchForm({
  q,
  setQ,
  kingdom,
  setKingdom,
  rank,
  setRank,
  loading,
  isKeySearch,
  hasResults,
  onSearch,
  onClear,
  inputRef,
}: SearchFormProps) {
  const { t } = useTranslation();

  const suggestions = useMemo(() => {
    if (q) return [];
    const key = kingdom.toLowerCase();
    if (!key) {
      return [
        t("search.animatedPlaceholderCanonicalOrScientific"),
        t("search.animatedPlaceholderCommonNames"),
        t("search.animatedPlaceholderSpeciesCode"),
      ];
    }
    return SUGGESTIONS_BY_KINGDOM[key] ?? SUGGESTIONS_BY_KINGDOM[""];
  }, [q, kingdom, t]);

  const animatedText = useAnimatedPlaceholder(suggestions);

  const showClear = q.length > 0 || hasResults;

  return (
    <form
      onSubmit={onSearch}
      className="flex h-9.5 flex-nowrap items-center gap-1.5"
    >
      {!isKeySearch && (
        <SearchFilter
          value={{ kingdom, rank }}
          onChange={(next) => {
            setKingdom(next.kingdom);
            setRank(next.rank);
          }}
        />
      )}

      {isKeySearch && (
        <span className="text-muted-foreground flex shrink-0 items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium">
          GBIF key
        </span>
      )}

      <div className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          className="h-9.5 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-inset"
          aria-label={t("search.searchTaxa")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {!q && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 select-none"
          >
            <span className="text-muted-foreground absolute inset-y-0 left-3 flex items-center text-sm">
              {animatedText}
            </span>
          </div>
        )}
      </div>

      {showClear && (
        <button
          type="button"
          onClick={() => {
            onClear();
            inputRef.current?.focus();
          }}
          aria-label={t("search.clearSearch")}
          className="text-muted-foreground hover:text-foreground h-9.5 shrink-0 cursor-pointer rounded-md border px-2.5 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}

      <button
        type="submit"
        disabled={loading || !q.trim()}
        aria-label={t("search.searchTaxa")}
        className="h-9.5 shrink-0 cursor-pointer rounded-md border px-3 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <SearchIcon className="size-4" />
        )}
      </button>
    </form>
  );
}
