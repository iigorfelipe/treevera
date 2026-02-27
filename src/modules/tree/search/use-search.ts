import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { searchTaxa, getParents, getSpecieDetail } from "@/services/apis/gbif";
import type { Rank, Taxon } from "@/common/types/api";
import type { PathNode } from "@/common/types/tree-atoms";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";

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
  const { navigateToNodes } = useTreeNavigation();

  const [q, setQ] = useState("");
  const [kingdom, setKingdom] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Taxon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Taxon | null>(null);
  const [minimized, setMinimized] = useState(false);

  const gbifKey = detectGbifKey(q);
  const isKeySearch = gbifKey !== null;

  const onClear = useCallback(() => {
    setQ("");
    setResults(null);
    setError(null);
    setSelected(null);
    setMinimized(false);
  }, []);

  const onSearch = useCallback(
    async (ev?: React.FormEvent) => {
      ev?.preventDefault();
      setError(null);
      setResults(null);
      setSelected(null);
      setMinimized(false);

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

          const taxon: Taxon = {
            key: nub,
            scientificName: (detail.scientificName || "") as string,
            canonicalName: (detail.canonicalName ||
              detail.scientificName ||
              "") as string,
            rank: ((d["rank"] as string)?.toUpperCase() as Rank) ?? "SPECIES",
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
          return Boolean(hasNub && kingdomOk);
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
        let nub: number | undefined;
        let detailRec: Record<string, unknown> | null = null;

        try {
          const detail = await getSpecieDetail(taxon.key);
          const d = detail as unknown as Record<string, unknown>;
          detailRec = d;
          nub =
            (d["nubKey"] as number | undefined) ??
            (d["key"] as number | undefined);
        } catch {
          //
        }

        const parentsSourceKey = nub ?? taxon.key;
        const parents = await getParents(parentsSourceKey);

        if (!parents || parents.length === 0) {
          setError(t("search.lineageError"));
          return;
        }

        const speciesMatch = taxon.rank === "SPECIES";
        const genusIndex = parents.findIndex((p) => p.rank === "GENUS");
        let sliceEnd = parents.length;
        if (speciesMatch && genusIndex !== -1) sliceEnd = genusIndex + 1;
        else if (taxon.rank === "GENUS") {
          const idx = parents.findIndex((p) => {
            const pp = p as unknown as Record<string, unknown>;
            const pNub =
              (pp["nubKey"] as number | undefined) ??
              (pp["key"] as number | undefined);
            return p.key === taxon.key || pNub === taxon.key;
          });
          if (idx !== -1) sliceEnd = idx + 1;
        }

        const slice = parents.slice(0, sliceEnd);

        const pathNodes: PathNode[] = slice.map((p) => {
          const pp = p as unknown as Record<string, unknown>;
          const nubKey =
            (pp["nubKey"] as number | undefined) ??
            (pp["key"] as number | undefined) ??
            0;
          const name =
            (pp["canonicalName"] as string | undefined) ||
            (pp["scientificName"] as string | undefined) ||
            (pp["name"] as string | undefined) ||
            (pp["rank"] as string | undefined) ||
            "";
          return {
            key: nubKey,
            rank: ((pp["rank"] as string)?.toUpperCase() as Rank) ?? "KINGDOM",
            name,
          };
        });

        const isSpecies =
          taxon.rank === "SPECIES" ||
          Boolean(
            detailRec && (detailRec["species"] || detailRec["species"] === ""),
          );

        if (isSpecies) {
          const speciesKey = nub ?? taxon.key;
          const speciesName =
            (detailRec?.["species"] as string | undefined) ||
            taxon.canonicalName ||
            taxon.scientificName ||
            "";
          const lastKey = pathNodes[pathNodes.length - 1]?.key;
          if (speciesKey && speciesKey !== lastKey) {
            pathNodes.push({
              key: speciesKey,
              rank: "SPECIES" as Rank,
              name: speciesName,
            });
          }
        } else {
          const taxonKey = nub ?? taxon.key;
          const lastKey = pathNodes[pathNodes.length - 1]?.key;
          if (taxonKey && taxonKey !== lastKey) {
            pathNodes.push({
              key: taxonKey,
              rank: taxon.rank,
              name: taxon.canonicalName || taxon.scientificName || "",
            });
          }
        }

        navigateToNodes(pathNodes, true);
        setSelected(taxon);
      } catch (e) {
        console.error(e);
        setError(t("search.pathError"));
      } finally {
        setLoading(false);
      }
    },
    [t, navigateToNodes],
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
  };
}
