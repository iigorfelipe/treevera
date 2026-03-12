import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue, useSetAtom } from "jotai";

import { searchTaxa, getSpecieDetail } from "@/services/apis/gbif";
import type { Rank, Taxon } from "@/common/types/api";
import { EXCLUDED_RANKS } from "@/common/utils/tree/children";
import { useNavigateToTaxon } from "@/hooks/use-navigate-to-taxon";
import type { TaxonDiagnostic } from "@/hooks/use-navigate-to-taxon";
import { focusSearchAtom, setFocusSearchAtom } from "@/store/tree";

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
  const [q, setQ] = useState("");
  const [kingdom, setKingdom] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Taxon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Taxon | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [diagnosis, setDiagnosis] = useState<TaxonDiagnostic | null>(null);

  const gbifKey = detectGbifKey(q);
  const isKeySearch = gbifKey !== null;

  // Listen for focus trigger from SearchBannerNode
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
    // Give React one extra frame to render the kingdom selection before focusing
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
  }, []);

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
        if (!kingdom) {
          setError(t("search.selectKingdomFirst"));
          return;
        }

        const data = await searchTaxa(trimmed, kingdom);
        const all = (data ?? []) as Taxon[];

        const filtered = all.filter((r) => {
          const det = r as unknown as Record<string, unknown>;
          const nub = det["nubKey"] as number | undefined;
          const hasNub = typeof nub === "number" && nub > 0;
          const k = String(r.kingdom ?? "").toLowerCase();
          const kingdomOk =
            k === String(kingdom ?? "").toLowerCase() ||
            (k === "metazoa" &&
              String(kingdom ?? "").toLowerCase() === "animalia");
          const rankOk = !EXCLUDED_RANKS.has(r.rank);
          return Boolean(hasNub && kingdomOk && rankOk);
        });

        const qLower = trimmed.toLowerCase();
        const tokens = qLower.split(/\s+/).filter(Boolean);

        if (tokens.length >= 2) {
          const exact = filtered.filter((r) => {
            const name = (
              (r.canonicalName || r.scientificName) ??
              ""
            ).toLowerCase();
            return name === qLower;
          });
          const chosen = exact.length
            ? exact
            : filtered.filter((r) => {
                const name = (
                  (r.canonicalName || r.scientificName) ??
                  ""
                ).toLowerCase();
                return tokens.every((tok) => name.includes(tok));
              });
          setResults(dedupeGenusSpecies(chosen, tokens));
        } else {
          const exactSpecies = filtered.filter(
            (r) =>
              ((r.canonicalName || r.scientificName) ?? "").toLowerCase() ===
                qLower && r.rank === "SPECIES",
          );
          const chosen = exactSpecies.length
            ? [
                ...exactSpecies,
                ...filtered.filter((r) => !exactSpecies.includes(r)),
              ]
            : filtered;
          setResults(dedupeGenusSpecies(chosen, tokens));
        }
      } catch (e) {
        console.error(e);
        setError(t("search.gbifError"));
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [q, kingdom, isKeySearch, gbifKey, t],
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
    [t, navigateToTaxon],
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
