import type { Taxon } from "@/common/types/api";
import { EXCLUDED_RANKS } from "@/common/utils/tree/children";

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

export function processTaxaResults(raw: Taxon[], q: string): Taxon[] {
  const qLower = q.trim().toLowerCase();
  const tokens = qLower.split(/\s+/).filter(Boolean);

  const filtered = raw.filter((r) => {
    const det = r as unknown as Record<string, unknown>;
    const nub = det["nubKey"] as number | undefined;
    const hasNub = typeof nub === "number" && nub > 0;
    return hasNub && !EXCLUDED_RANKS.has(r.rank);
  });

  const dedupeFiltered = (list: Taxon[]): Taxon[] => {
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
        ? [...exactSpecies, ...list.filter((r) => !exactSpecies.includes(r))]
        : list;
      return dedupeGenusSpecies(chosen, tokens);
    }
  };

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
  return combined;
}
