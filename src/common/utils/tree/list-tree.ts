import type { Rank, Taxon } from "@/common/types/api";
import type {
  ListTreeSpecies,
  NodeEntity,
  PathNode,
} from "@/common/types/tree-atoms";
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
  family: string | null;
  imageUrl: string | null;
  isFavorite: boolean;
  isKnown: boolean;
  parents: Taxon[];
};

export type BuiltListTree = {
  nodes: NodeEntity[];
  rootKeys: number[];
  childrenByKey: Record<number, number[]>;
  expandedKeys: number[];
  speciesCount: number;
  species: ListTreeSpecies[];
};

const isValidTaxon = (taxon: Taxon | undefined): taxon is Taxon =>
  !!taxon && Number.isFinite(taxon.key) && LIST_TREE_RANK_SET.has(taxon.rank);

const addUnique = (items: number[], value: number) => {
  if (!items.includes(value)) items.push(value);
};

const getTaxonName = (taxon: Taxon) =>
  taxon.canonicalName || taxon.scientificName || NAME_KINGDOM_BY_KEY[taxon.key];

const toPathNode = (taxon: Taxon): PathNode => ({
  key: taxon.key,
  rank: taxon.rank,
  name: getTaxonName(taxon) ?? "",
});

const toNodeEntity = (
  taxon: Taxon,
  parentKey: number | undefined,
  kingdom: Taxon["kingdom"],
  imageUrl?: string | null,
): NodeEntity => ({
  key: taxon.key,
  rank: taxon.rank,
  color: taxon.rank === "KINGDOM" ? COLOR_KINGDOM_BY_KEY[taxon.key] : undefined,
  numDescendants: taxon.rank === "SPECIES" ? 0 : (taxon.numDescendants ?? 0),
  canonicalName: taxon.rank === "KINGDOM" ? undefined : getTaxonName(taxon),
  scientificName: taxon.scientificName,
  kingdom,
  imageUrl: taxon.rank === "SPECIES" ? imageUrl : undefined,
  parentKey,
});

export const buildListTree = (paths: ListTreePathInput[]): BuiltListTree => {
  const nodes = new Map<number, NodeEntity>();
  const rootKeys: number[] = [];
  const expandedKeys = new Set<number>();
  const childrenByKey: Record<number, number[]> = {};
  const species: ListTreeSpecies[] = [];

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
    const pathNodes = path.map(toPathNode);
    const rankMap: Partial<Record<Rank, PathNode>> = {};
    let previousKey: number | undefined;

    for (const taxon of path) {
      rankMap[taxon.rank] = toPathNode(taxon);
      const node = toNodeEntity(taxon, previousKey, kingdom, item.imageUrl);
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

    species.push({
      gbifKey: item.speciesKey,
      canonicalName: item.canonicalName ?? speciesNode.scientificName,
      family: item.family,
      imageUrl: item.imageUrl,
      isFavorite: item.isFavorite,
      isKnown: item.isKnown,
      path: pathNodes,
      ranks: rankMap,
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    rootKeys,
    childrenByKey,
    expandedKeys: Array.from(expandedKeys),
    speciesCount: species.length,
    species,
  };
};
