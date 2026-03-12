import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { getChildren } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { Rank, Taxon } from "@/common/types/api";
import { filterChildren } from "@/common/utils/tree/children";
import { showEmptyNodesAtom } from "@/store/user-settings";

export type RawGbifChild = Taxon & {
  nubKey?: number;
  nameType?: string;
  origin?: string;
  taxonomicStatus?: string;
  issues?: string[];
};

const VALID_ORIGINS = new Set(["SOURCE", "DENORMED_CLASSIFICATION"]);
const CRITICAL_ISSUES = new Set([
  "PARENT_CYCLE",
  "RELATIONSHIP_MISSING",
  "RANK_INVALID",
  "BACKBONE_MATCH_NONE",
]);

export const isBackboneNode = (item: RawGbifChild): boolean => {
  if (!item.canonicalName) return false;
  if (item.nubKey !== undefined && item.nubKey !== item.key) return false;
  if (item.nameType && item.nameType !== "SCIENTIFIC") return false;
  if (item.origin && !VALID_ORIGINS.has(item.origin)) return false;
  if (item.taxonomicStatus === "DOUBTFUL") return false;
  if (item.issues?.some((issue) => CRITICAL_ISSUES.has(issue))) return false;
  return true;
};

type UseGetChildrenParams = {
  parentKey: number;
  expanded: boolean;
  numDescendants: number;
  parentRank?: Rank;
};

export const mapToTaxon = (item: Taxon): Taxon => {
  const taxon: Taxon = {
    key: item.key,
    scientificName: item.scientificName,
    canonicalName: item.canonicalName,
    rank: item.rank,
    kingdom: item.kingdom,
    numDescendants: item.numDescendants,
    phylum: item.phylum,
  };

  if (item.class) taxon.class = item.class;
  if (item.order) taxon.order = item.order;
  if (item.family) taxon.family = item.family;
  if (item.genus) taxon.genus = item.genus;

  return taxon;
};

export type ChildrenQueryResult = {
  children: Taxon[];
  endOfRecords: boolean;
};

export const useGetChildren = ({
  parentKey,
  expanded,
  numDescendants,
  parentRank,
}: UseGetChildrenParams) => {
  const { children_key } = QUERY_KEYS;
  const showEmptyNodes = useAtomValue(showEmptyNodesAtom);

  return useQuery<ChildrenQueryResult>({
    queryKey: [children_key, parentKey, showEmptyNodes],
    queryFn: async () => {
      const { results: raw, endOfRecords } = await getChildren(parentKey);

      const filtered = (raw as RawGbifChild[]).filter(isBackboneNode);

      const visible = showEmptyNodes
        ? filtered
        : filtered.filter(
            (item) => item.numDescendants > 0 || item.rank === "SPECIES",
          );

      return {
        children: filterChildren(visible, parentRank).map(mapToTaxon),
        endOfRecords,
      };
    },
    enabled: !!parentKey && expanded && numDescendants !== 0,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
