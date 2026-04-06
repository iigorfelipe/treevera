import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { searchTaxa, getSpecieDetail } from "@/services/apis/gbif";
import type { Rank, Taxon } from "@/common/types/api";
import { EXCLUDED_RANKS } from "@/common/utils/tree/children";
import { useNavigateToTaxon } from "@/hooks/use-navigate-to-taxon";
import {
  focusSearchAtom,
  setFocusSearchAtom,
  searchQAtom,
  searchKingdomAtom,
  searchResultsAtom,
  searchErrorAtom,
  searchSelectedAtom,
  searchMinimizedAtom,
  searchDiagnosisAtom,
} from "@/store/tree";

const detectGbifKey = (q: string): number | null => {
  const trimmed = q.trim();
  if (/^\d+$/.test(trimmed) && trimmed.length > 0) {
    const n = parseInt(trimmed, 10);
    return n > 0 ? n : null;
  }
  return null;
};

const dedupeGenusSpecies = (list: Taxon[], tokens: string[]): Taxon[] => {
  const speciesMap = new Map<string, Taxon>();
  const genusMap = new Map<string, Taxon>();

  list.forEach((r) => {
    const name = ((r.canonicalName || r.scientificName) ?? "").trim();
    if (!name) return;
    const parts = name.toLowerCase().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const speciesKey = `${parts[0]} ${parts[1]}`;
      const existing = speciesMap.get(speciesKey);
      if (!existing || existing.rank !== "SPECIES")
        speciesMap.set(speciesKey, r);
    } else if (parts.length === 1) {
      const genusKey = parts[0];
      const existing = genusMap.get(genusKey);
      if (!existing || existing.rank !== "GENUS") genusMap.set(genusKey, r);
    }
  });

  const firstToken = tokens[0] ?? "";
  const results: Taxon[] = [];

  if (tokens.length === 1 && firstToken) {
    for (const [spk, tax] of speciesMap.entries()) {
      const parts = spk.split(" ");
      if (parts[1] === firstToken) results.push(tax);
    }

    if (genusMap.has(firstToken)) {
      results.unshift(genusMap.get(firstToken)!);
    } else {
      for (const v of genusMap.values()) {
        if (String(v.genus ?? "").toLowerCase() === firstToken) {
          results.unshift(v);
          break;
        }
      }
    }

    if (results.length > 0) return results.slice(0, 10);
  }

  if (firstToken && genusMap.has(firstToken)) {
    results.push(genusMap.get(firstToken)!);
  } else if (firstToken) {
    for (const v of genusMap.values()) {
      if (String(v.genus ?? "").toLowerCase() === firstToken) {
        results.push(v);
        break;
      }
    }
  }

  for (const [spk, tax] of speciesMap.entries()) {
    if (spk.startsWith(firstToken + " ")) {
      results.push(tax);
      break;
    }
  }

  if (results.length === 0) {
    if (genusMap.size > 0) {
      const g = genusMap.values().next().value;
      if (g) results.push(g);
    }
    if (speciesMap.size > 0) {
      const s = speciesMap.values().next().value;
      if (s) results.push(s);
    }
  }

  return results;
};

export function useSearch() {
  const { t } = useTranslation();
  const { navigateToTaxon } = useNavigateToTaxon();

  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useAtom(searchQAtom);
  const [kingdom, setKingdom] = useAtom(searchKingdomAtom);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useAtom(searchResultsAtom);
  const [error, setError] = useAtom(searchErrorAtom);
  const [selected, setSelected] = useAtom(searchSelectedAtom);
  const [minimized, setMinimized] = useAtom(searchMinimizedAtom);
  const [diagnosis, setDiagnosis] = useAtom(searchDiagnosisAtom);

  const gbifKey = detectGbifKey(q);
  const isKeySearch = gbifKey !== null;

  const focusTrigger = useAtomValue(focusSearchAtom);
  const setFocusTrigger = useSetAtom(setFocusSearchAtom);
  useEffect(() => {
    if (!focusTrigger) return;
    setQ("");
    setResults(null);
    setError(null);
    setSelected(null);
    setDiagnosis(null);
    setMinimized(false);
    if (focusTrigger.kingdom) setKingdom(focusTrigger.kingdom);
    setTimeout(() => inputRef.current?.focus(), 50);
    setFocusTrigger(null);
  }, [focusTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClear = useCallback(() => {
    setQ("");
    setResults(null);
    setError(null);
    setSelected(null);
    setMinimized(false);
    setDiagnosis(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = useCallback(
    async (ev?: React.FormEvent) => {
      ev?.preventDefault();
      setError(null);
      setResults(null);
      setSelected(null);
      setMinimized(false);
      setDiagnosis(null);

      const trimmed = q.trim();
      if (!trimmed) return;

      setLoading(true);

      try {
        // #region GBIF Key search
        if (isKeySearch && gbifKey !== null) {
          const detail = await getSpecieDetail(gbifKey);
          const d = detail as unknown as Record<string, unknown>;
          const nub =
            (d["nubKey"] as number | undefined) ??
            (d["key"] as number | undefined);

          if (!nub) {
            setError(t("search.keyNotFound"));
            setResults(null);
            return;
          }

          const rank =
            ((d["rank"] as string)?.toUpperCase() as Rank) ?? "SPECIES";
          if (EXCLUDED_RANKS.has(rank)) {
            setError(t("search.rankNotInTree"));
            setResults(null);
            return;
          }

          const taxon: Taxon = {
            key: nub,
            scientificName: (detail.scientificName || "") as string,
            canonicalName: (detail.canonicalName ||
              detail.scientificName ||
              "") as string,
            rank,
            kingdom: (detail.kingdom || "animalia") as Taxon["kingdom"],
            numDescendants: 0,
            phylum: detail.phylum || "",
            class: detail.class,
            order: detail.order,
            family: detail.family,
            genus: detail.genus,
          };

          setResults([taxon]);
          return;
        }

        // #region Text search
        const data = await searchTaxa(trimmed, kingdom || undefined);
        const all = (data ?? []) as Taxon[];

        const filtered = all.filter((r) => {
          const det = r as unknown as Record<string, unknown>;
          const nub = det["nubKey"] as number | undefined;
          const hasNub = typeof nub === "number" && nub > 0;
          const rankOk = !EXCLUDED_RANKS.has(r.rank);
          if (!kingdom) return Boolean(hasNub && rankOk);
          const k = String(r.kingdom ?? "").toLowerCase();
          const kingdomOk =
            k === String(kingdom ?? "").toLowerCase() ||
            (k === "metazoa" &&
              String(kingdom ?? "").toLowerCase() === "animalia");
          return Boolean(hasNub && kingdomOk && rankOk);
        });

        const qLower = trimmed.toLowerCase();
        const tokens = qLower.split(/\s+/).filter(Boolean);

        const dedupeFiltered = (list: Taxon[]) => {
          if (tokens.length >= 2) {
            const exact = list.filter((r) => {
              const name = (
                (r.canonicalName || r.scientificName) ??
                ""
              ).toLowerCase();
              return name === qLower;
            });
            const chosen = exact.length
              ? exact
              : list.filter((r) => {
                  const name = (
                    (r.canonicalName || r.scientificName) ??
                    ""
                  ).toLowerCase();
                  return tokens.every((tok) => name.includes(tok));
                });
            return dedupeGenusSpecies(chosen, tokens);
          } else {
            const exactSpecies = list.filter(
              (r) =>
                ((r.canonicalName || r.scientificName) ?? "").toLowerCase() ===
                  qLower && r.rank === "SPECIES",
            );
            const chosen = exactSpecies.length
              ? [
                  ...exactSpecies,
                  ...list.filter((r) => !exactSpecies.includes(r)),
                ]
              : list;
            return dedupeGenusSpecies(chosen, tokens);
          }
        };

        if (!kingdom) {
          const byKingdom = new Map<string, Taxon[]>();
          for (const r of filtered) {
            const k = String(r.kingdom ?? "unknown").toLowerCase();
            if (!byKingdom.has(k)) byKingdom.set(k, []);
            byKingdom.get(k)!.push(r);
          }
          const combined: Taxon[] = [];
          for (const group of byKingdom.values()) {
            combined.push(...dedupeFiltered(group));
          }
          setResults(combined);
        } else {
          setResults(dedupeFiltered(filtered));
        }
      } catch (e) {
        console.error(e);
        setError(t("search.gbifError"));
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [q, kingdom, isKeySearch, gbifKey, t], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const onPick = useCallback(
    async (taxon: Taxon) => {
      setLoading(true);
      try {
        const result = await navigateToTaxon(taxon);
        setSelected(taxon);
        setDiagnosis(result.diagnostic);
      } catch (e) {
        console.error(e);
        setError(t("search.pathError"));
      } finally {
        setLoading(false);
      }
    },
    [t, navigateToTaxon], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return {
    q,
    setQ,
    kingdom,
    setKingdom,
    loading,
    results,
    error,
    selected,
    minimized,
    setMinimized,
    isKeySearch,
    onSearch,
    onPick,
    onClear,
    diagnosis,
    inputRef,
  };
}
