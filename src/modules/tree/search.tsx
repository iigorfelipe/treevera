import React, { useMemo, useState } from "react";
import { useSetAtom } from "jotai";

import { searchTaxa, getParents, getSpecieDetail } from "@/services/apis/gbif";
import { setExpandedPathAtom } from "@/store/tree";
import { NAME_KINGDOM_BY_KEY } from "@/common/constants/tree";
import { capitalizar } from "@/common/utils/string";
import type { Rank, Taxon } from "@/common/types/api";
import type { PathNode } from "@/common/types/tree-atoms";
import { getRankIcon } from "@/common/utils/tree/ranks";
import { Image } from "@/common/components/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Loader, SearchIcon } from "lucide-react";

// TODO: refatorar para usar jotai
export const Search = () => {
  const [q, setQ] = useState("");
  const [kingdom, setKingdom] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Taxon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Taxon | null>(null);
  const [minimized, setMinimized] = useState(false);

  const setExpandedPath = useSetAtom(setExpandedPathAtom);

  const kingdomOptions = useMemo(() => {
    return Object.entries(NAME_KINGDOM_BY_KEY).map(([k, name]) => ({
      key: Number(k),
      name,
    }));
  }, []);

  const SUGGESTION_BY_KINGDOM = {
    animalia: "gorilla gorilla",
    plantae: "zea mays",
    fungi: "amanita muscaria",
    bacteria: "escherichia coli",
    archaea: "halobacterium salinarum",
    chromista: "navicula radiosa",
    protozoa: "amoeba proteus",
  } as const;

  type KingdomKey = keyof typeof SUGGESTION_BY_KINGDOM;

  const placeholderText = useMemo(() => {
    if (!kingdom) return "Selecione um reino";
    const k = String(kingdom).toLowerCase() as KingdomKey;
    const suggestion = SUGGESTION_BY_KINGDOM[k] ?? "sapiens";
    return `Exemplo: ${suggestion}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kingdom]);

  const onSearch = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setError(null);
    if (!kingdom) {
      setError("Selecione um reino para buscar");
      return;
    }
    if (!q || !q.trim()) return;

    setLoading(true);
    try {
      const data = await searchTaxa(q.trim(), kingdom);

      const all = (data ?? []) as Taxon[];

      const filtered = all.filter((r) => {
        const det = r as unknown as Record<string, unknown>;
        const nub = det["nubKey"] as number | undefined;
        const hasNub = typeof nub === "number" && nub > 0;
        const isSub = String(r.rank ?? "")
          .toLowerCase()
          .includes("sub");
        const k = String(r.kingdom ?? "").toLowerCase();
        const kingdomOk =
          k === String(kingdom ?? "").toLowerCase() ||
          (k === "metazoa" &&
            String(kingdom ?? "").toLowerCase() === "animalia");
        return Boolean(hasNub && !isSub && kingdomOk);
      }) as Taxon[];

      const qLower = q.trim().toLowerCase();
      const tokens = qLower.split(/\s+/).filter(Boolean);

      const dedupeGenusSpecies = (list: Taxon[]) => {
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
            if (!existing || existing.rank !== "GENUS")
              genusMap.set(genusKey, r);
          }
        });

        const firstToken = tokens[0];
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
              return tokens.every((t) => name.includes(t));
            });
        setResults(dedupeGenusSpecies(chosen));
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
        setResults(dedupeGenusSpecies(chosen));
      }
    } catch (e) {
      console.error(e);
      setError("Erro ao consultar GBIF");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const onPick = async (taxon: Taxon) => {
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
        setError("Não foi possível obter linhagem para o item selecionado");
        setLoading(false);
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
          rank: (pp["rank"] as Rank) ?? ("KINGDOM" as Rank),
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
      }

      setExpandedPath(pathNodes);
      setSelected(taxon);
    } catch (e) {
      console.error(e);
      setError("Erro ao montar o caminho selecionado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={onSearch}
        className="flex h-9.5 flex-nowrap items-center gap-2"
      >
        <Select value={kingdom} onValueChange={(e) => setKingdom(e)}>
          <SelectTrigger className="rounded-lg border px-2 text-sm font-medium">
            <SelectValue placeholder="Reino" asChild>
              {kingdom ? (
                <Image
                  src={getRankIcon(
                    kingdomOptions.find((k) => k.name === kingdom)?.key ?? 0,
                  )}
                  alt="Reino"
                  className="size-5"
                />
              ) : (
                <span>Reino</span>
              )}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="rounded-lg text-sm font-medium">
            {kingdomOptions.map((opt) => (
              <SelectItem key={opt.key} value={opt.name}>
                <Image
                  src={getRankIcon(opt.key)}
                  alt={`${kingdom} icon`}
                  className="size-5"
                />
                {capitalizar(opt.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder={placeholderText}
          className="h-full min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
          aria-label="Pesquisar taxa"
        />

        <button
          type="submit"
          disabled={loading}
          className="h-full cursor-pointer rounded-md border px-3 py-2 text-sm disabled:opacity-60"
        >
          {loading ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <SearchIcon className="size-4" />
          )}
        </button>
      </form>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {results && (
        <div className="bg-card mt-3 w-full rounded-lg border p-2 shadow-sm">
          <button
            onClick={() => setMinimized((s) => !s)}
            className="flex w-full cursor-pointer items-center justify-between px-2"
            aria-label={
              minimized ? "Expandir resultados" : "Minimizar resultados"
            }
          >
            <strong className="text-sm">{results.length} resultados</strong>
            <span className="text-muted-foreground">
              {minimized ? "▾" : "▴"}
            </span>
          </button>

          {!minimized && (
            <ul className="max-h-60 space-y-1 overflow-auto">
              {results.map((r) => (
                <li key={r.key}>
                  <button
                    onClick={() => onPick(r)}
                    className={`hover:bg-accent w-full cursor-pointer rounded-lg px-3 py-2 text-left ${selected?.key === r.key ? "bg-muted font-medium" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {r.canonicalName || r.scientificName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {[
                            r.kingdom && capitalizar(String(r.kingdom)),
                            r.phylum && capitalizar(String(r.phylum)),
                            ((r as unknown as Record<string, unknown>)[
                              "class"
                            ] as string | undefined) &&
                              capitalizar(
                                String(
                                  (r as unknown as Record<string, unknown>)[
                                    "class"
                                  ],
                                ),
                              ),
                            r.order && capitalizar(String(r.order)),
                            r.family && capitalizar(String(r.family)),
                            r.genus && capitalizar(String(r.genus)),
                          ]
                            .filter(Boolean)
                            .join(" › ")}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
