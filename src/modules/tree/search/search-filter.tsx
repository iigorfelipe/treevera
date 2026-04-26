import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Image } from "@/common/components/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import type { Rank } from "@/common/types/api";
import { capitalizar } from "@/common/utils/string";
import { getRankIcon } from "@/common/utils/tree/ranks";

export type SearchRankFilter =
  | "PHYLUM"
  | "CLASS"
  | "ORDER"
  | "FAMILY"
  | "GENUS"
  | "SPECIES";

const SEARCH_RANKS: SearchRankFilter[] = [
  "PHYLUM",
  "CLASS",
  "ORDER",
  "FAMILY",
  "GENUS",
  "SPECIES",
];

type SearchFilterValue = {
  kingdom: string;
  rank: Rank | "";
};

type SearchFilterProps = {
  value: SearchFilterValue;
  onChange: (value: SearchFilterValue) => void;
};

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const kingdomOptions = useMemo(
    () =>
      Object.entries(NAME_KINGDOM_BY_KEY).map(([key, name]) => ({
        key: Number(key),
        name,
      })),
    [],
  );

  const selectedKingdom = kingdomOptions.find(
    (option) => option.name === value.kingdom,
  );

  const label = value.rank
    ? t(`ranks.${value.rank}`)
    : value.kingdom
      ? capitalizar(value.kingdom)
      : t("search.filter");

  const selectKingdom = (kingdom: string) => {
    const next =
      value.kingdom === kingdom && !value.rank
        ? { kingdom: "", rank: "" as const }
        : { kingdom, rank: "" as const };
    onChange(next);
    setOpen(false);
  };

  const selectRank = (kingdom: string, rank: SearchRankFilter) => {
    const next =
      value.kingdom === kingdom && value.rank === rank
        ? { kingdom, rank: "" as const }
        : { kingdom, rank };
    onChange(next);
    setOpen(false);
  };

  const clearFilter = () => {
    onChange({ kingdom: "", rank: "" });
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9.5 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2 text-sm font-medium"
          aria-label={t("search.filter")}
        >
          {selectedKingdom && (
            <Image
              src={getRankIcon(selectedKingdom.key)}
              alt={`${selectedKingdom.name} icon`}
              className="size-5"
            />
          )}
          <span className="max-w-24 truncate">{label}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48 rounded-lg text-sm">
        <DropdownMenuItem onClick={clearFilter}>
          <span className="w-4">
            {!value.kingdom && <Check className="size-4" />}
          </span>
          {t("search.filterAll")}
        </DropdownMenuItem>

        {kingdomOptions.map((option) => {
          const kingdomSelected = value.kingdom === option.name;

          return (
            <DropdownMenuSub key={option.key}>
              <DropdownMenuSubTrigger
                onClick={() => selectKingdom(option.name)}
                className="gap-2"
              >
                <span className="flex w-4 justify-center">
                  {kingdomSelected && <Check className="size-4" />}
                </span>
                <Image
                  src={getRankIcon(option.key)}
                  alt={`${option.name} icon`}
                  className="size-5"
                />
                <span>{capitalizar(option.name)}</span>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="w-40">
                {SEARCH_RANKS.map((rank) => {
                  const selected = kingdomSelected && value.rank === rank;

                  return (
                    <DropdownMenuItem
                      key={rank}
                      onClick={() => selectRank(option.name, rank)}
                    >
                      <span className="flex w-4 justify-center">
                        {selected && <Check className="size-4" />}
                      </span>
                      {t(`ranks.${rank}`)}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
