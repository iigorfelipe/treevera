import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader, SearchIcon, X } from "lucide-react";

import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import { getRankIcon } from "@/common/utils/tree/ranks";
import { Image } from "@/common/components/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";

import {
  useAnimatedPlaceholder,
  SUGGESTIONS_BY_KINGDOM,
} from "./use-animated-placeholder";

interface SearchFormProps {
  q: string;
  setQ: (v: string) => void;
  kingdom: string;
  setKingdom: (v: string) => void;
  loading: boolean;
  isKeySearch: boolean;
  hasResults: boolean;
  onSearch: (ev?: React.FormEvent) => void;
  onClear: () => void;
}

export function SearchForm({
  q,
  setQ,
  kingdom,
  setKingdom,
  loading,
  isKeySearch,
  hasResults,
  onSearch,
  onClear,
}: SearchFormProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const kingdomOptions = useMemo(
    () =>
      Object.entries(NAME_KINGDOM_BY_KEY).map(([k, name]) => ({
        key: Number(k),
        name,
      })),
    [],
  );

  const suggestions = useMemo(() => {
    if (q) return [];
    const key = kingdom.toLowerCase();
    return SUGGESTIONS_BY_KINGDOM[key] ?? SUGGESTIONS_BY_KINGDOM[""];
  }, [q, kingdom]);

  const animatedText = useAnimatedPlaceholder(suggestions);

  const staticPlaceholder = t("search.searchByNameOrKey");

  const placeholder = animatedText || staticPlaceholder;

  const showClear = q.length > 0 || hasResults;

  return (
    <form
      onSubmit={onSearch}
      className="flex h-9.5 flex-nowrap items-center gap-1.5"
    >
      {!isKeySearch && (
        <Select value={kingdom} onValueChange={setKingdom}>
          <SelectTrigger className="rounded-lg border px-2 text-sm font-medium">
            <SelectValue placeholder={t("search.kingdom")}>
              {kingdom ? (
                <Image
                  src={getRankIcon(
                    kingdomOptions.find((k) => k.name === kingdom)?.key ?? 0,
                  )}
                  alt="Reino"
                  className="size-5"
                />
              ) : (
                <span>{t("search.kingdom")}</span>
              )}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="rounded-lg text-sm font-medium">
            {kingdomOptions.map((opt) => (
              <SelectItem key={opt.key} value={opt.name}>
                <Image
                  src={getRankIcon(opt.key)}
                  alt={`${opt.name} icon`}
                  className="size-5"
                />
                {capitalizar(opt.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          placeholder={placeholder}
          className="h-9.5 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-inset"
          aria-label={t("search.searchTaxa")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
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
