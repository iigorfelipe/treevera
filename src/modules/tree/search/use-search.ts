import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { getSpecieDetail } from "@/services/apis/gbif";
import {
  isNavigableTreeTaxon,
  resolveTaxaBackboneLineage,
  searchBackboneTaxaByUserQuery,
} from "@/services/apis/species-search";
import type { Rank, Taxon } from "@/common/types/api";
import { EXCLUDED_RANKS } from "@/common/utils/tree/children";
import { useNavigateToTaxon } from "@/hooks/use-navigate-to-taxon";
import {
  focusSearchAtom,
  setFocusSearchAtom,
  searchQAtom,
  searchKingdomAtom,
  searchRankAtom,
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

export function useSearch() {
  const { t, i18n } = useTranslation();
  const { navigateToTaxon } = useNavigateToTaxon();

  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useAtom(searchQAtom);
  const [kingdom, setKingdom] = useAtom(searchKingdomAtom);
  const [rank, setRank] = useAtom(searchRankAtom);
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
    setRank("");
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
            nubKey: nub,
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

          const [resolvedTaxon] = await resolveTaxaBackboneLineage([taxon]);
          const resultTaxon = resolvedTaxon ?? taxon;
          if (!isNavigableTreeTaxon(resultTaxon)) {
            setError(t("search.rankNotInTree"));
            setResults(null);
            return;
          }

          setResults([resultTaxon]);
          return;
        }

        // #region Text search
        const data = await searchBackboneTaxaByUserQuery(
          trimmed,
          kingdom || undefined,
          rank || undefined,
          i18n.resolvedLanguage ?? i18n.language,
        );
        setResults(data);
      } catch (e) {
        console.error(e);
        setError(t("search.gbifError"));
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [q, kingdom, rank, isKeySearch, gbifKey, t, i18n], // eslint-disable-line react-hooks/exhaustive-deps
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
    rank,
    setRank,
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
