import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { getChildren } from "@/services/apis/gbif";
import { QUERY_KEYS } from "./keys";
import type { Taxon } from "@/common/types/api";
import { filterChildren } from "@/common/utils/tree/children";
import { showEmptyNodesAtom } from "@/store/user-settings";

type RawGbifChild = Taxon & { nubKey?: number; taxonomicStatus?: string };

const isBackboneAccepted = (item: RawGbifChild): boolean => {
  if (item.taxonomicStatus && item.taxonomicStatus !== "ACCEPTED") return false;
  if (item.nubKey !== undefined && item.nubKey !== item.key) return false;
  if (!item.canonicalName) return false;
  return true;
};

type UseGetChildrenParams = {
  parentKey: number;
  expanded: boolean;
  numDescendants: number;
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

export const useGetChildren = ({
  parentKey,
  expanded,
  numDescendants,
}: UseGetChildrenParams) => {
  const { children_key } = QUERY_KEYS;
  const showEmptyNodes = useAtomValue(showEmptyNodesAtom);

  return useQuery<Taxon[]>({
    queryKey: [children_key, parentKey, showEmptyNodes],
    queryFn: async () => {
      const raw = (await getChildren(parentKey)) as RawGbifChild[];
      const backbone = raw.filter(isBackboneAccepted);
      const visible = showEmptyNodes
        ? backbone
        : backbone.filter(
            (item) => item.numDescendants > 0 || item.rank === "SPECIES",
          );
      return filterChildren(visible).map(mapToTaxon);
    },
    enabled: !!parentKey && expanded && numDescendants !== 0,
    staleTime: 1000 * 60 * 60 * 24, // 1 dia
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
  });
};
