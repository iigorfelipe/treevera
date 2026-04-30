import type { Rank, Taxon } from "@/common/types/api";
import type { NodeEntity } from "@/common/types/tree-atoms";
import {
  COLOR_KINGDOM_BY_KEY,
  NAME_KINGDOM_BY_KEY,
} from "@/common/constants/tree";

const LIST_TREE_RANKS: Rank[] = [
  "KINGDOM",
  "PHYLUM",
  "CLASS",
  "ORDER",
  "FAMILY",
  "GENUS",
  "SPECIES",
];

const LIST_TREE_RANK_SET = new Set<Rank>(LIST_TREE_RANKS);

export type ListTreePathInput = {
  speciesKey: number;
  canonicalName: string | null;
  parents: Taxon[];
};

export type BuiltListTree = {
  nodes: NodeEntity[];
  rootKeys: number[];
  childrenByKey: Record<number, number[]>;
  expandedKeys: number[];
  speciesCount: number;
};

const isValidTaxon = (taxon: Taxon | undefined): taxon is Taxon =>
  !!taxon && Number.isFinite(taxon.key) && LIST_TREE_RANK_SET.has(taxon.rank);

const addUnique = (items: number[], value: number) => {
  if (!items.includes(value)) items.push(value);
};

const getTaxonName = (taxon: Taxon) =>
  taxon.canonicalName || taxon.scientificName || NAME_KINGDOM_BY_KEY[taxon.key];

const toNodeEntity = (
  taxon: Taxon,
  parentKey: number | undefined,
  kingdom: Taxon["kingdom"],
): NodeEntity => ({
  key: taxon.key,
  rank: taxon.rank,
  color: taxon.rank === "KINGDOM" ? COLOR_KINGDOM_BY_KEY[taxon.key] : undefined,
  numDescendants: taxon.rank === "SPECIES" ? 0 : (taxon.numDescendants ?? 0),
  canonicalName: taxon.rank === "KINGDOM" ? undefined : getTaxonName(taxon),
  scientificName: taxon.scientificName,
  kingdom,
  parentKey,
});

export const buildListTree = (paths: ListTreePathInput[]): BuiltListTree => {
  const nodes = new Map<number, NodeEntity>();
  const rootKeys: number[] = [];
  const expandedKeys = new Set<number>();
  const childrenByKey: Record<number, number[]> = {};
  let speciesCount = 0;

  for (const item of paths) {
    const parents = item.parents.filter(isValidTaxon);
    const kingdomNode = parents.find((taxon) => taxon.rank === "KINGDOM");
    const kingdom = kingdomNode?.kingdom;

    if (!kingdom || parents.length === 0) continue;

    const speciesNode: Taxon = {
      key: item.speciesKey,
      rank: "SPECIES",
      canonicalName: item.canonicalName ?? "",
      scientificName: item.canonicalName ?? "",
      kingdom,
      numDescendants: 0,
      phylum: "",
    };

    const path = [...parents, speciesNode].filter(isValidTaxon);
    let previousKey: number | undefined;

    for (const taxon of path) {
      const node = toNodeEntity(taxon, previousKey, kingdom);
      const existing = nodes.get(node.key);

      nodes.set(node.key, {
        ...existing,
        ...node,
        parentKey: existing?.parentKey ?? node.parentKey,
      });

      if (previousKey === undefined) {
        addUnique(rootKeys, node.key);
      } else {
        childrenByKey[previousKey] ??= [];
        addUnique(childrenByKey[previousKey], node.key);
        expandedKeys.add(previousKey);
      }

      previousKey = node.key;
    }

    speciesCount++;
  }

  return {
    nodes: Array.from(nodes.values()),
    rootKeys,
    childrenByKey,
    expandedKeys: Array.from(expandedKeys),
    speciesCount,
  };
};
