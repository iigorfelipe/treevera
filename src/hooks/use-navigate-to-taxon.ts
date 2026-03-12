import { useCallback } from "react";
import { useSetAtom } from "jotai";

import { getParents, getSpecieDetail } from "@/services/apis/gbif";
import type { Rank, Taxon } from "@/common/types/api";
import type { NodeEntity, PathNode } from "@/common/types/tree-atoms";
import { injectPathNodesAtom } from "@/store/tree";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";

export type TaxonDiagnostic = {
  taxonomicStatus: string;
  gbifKey: number;
  acceptedKey?: number;
  acceptedName?: string;
  remarks?: string;
};

export function useNavigateToTaxon() {
  const injectPathNodes = useSetAtom(injectPathNodesAtom);
  const { navigateToNodes } = useTreeNavigation();

  const navigateToTaxon = useCallback(
    async (taxon: Taxon): Promise<{ diagnostic: TaxonDiagnostic | null }> => {
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

      let backboneRec = detailRec;
      if (nub !== undefined && nub !== taxon.key) {
        try {
          backboneRec = (await getSpecieDetail(nub)) as unknown as Record<
            string,
            unknown
          >;
        } catch {
          //
        }
      }
      const taxonomicStatus = backboneRec?.["taxonomicStatus"] as
        | string
        | undefined;
      let diagnostic: TaxonDiagnostic | null = null;
      if (taxonomicStatus && taxonomicStatus !== "ACCEPTED") {
        diagnostic = {
          taxonomicStatus,
          gbifKey: nub ?? taxon.key,
          acceptedKey: (backboneRec?.["acceptedKey"] ??
            backboneRec?.["acceptedUsageKey"]) as number | undefined,
          acceptedName: backboneRec?.["accepted"] as string | undefined,
          remarks: backboneRec?.["remarks"] as string | undefined,
        };
      }

      const parentsSourceKey = nub ?? taxon.key;
      const parents = await getParents(parentsSourceKey);

      if (!parents || parents.length === 0) {
        throw new Error("lineageError");
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

      if (diagnostic === null) {
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
      }

      const entitiesToInject: NodeEntity[] = pathNodes.map((pn, i) => {
        const sliceItem = i < slice.length ? slice[i] : null;
        const pp = sliceItem as unknown as Record<string, unknown> | null;
        return {
          key: pn.key,
          rank: pn.rank,
          numDescendants:
            (pp?.["numDescendants"] as number | undefined) ??
            (pn.rank === "SPECIES" ? 0 : 1),
          canonicalName: pn.name || undefined,
          kingdom: taxon.kingdom,
          parentKey: i > 0 ? pathNodes[i - 1].key : undefined,
        };
      });

      injectPathNodes(entitiesToInject);
      navigateToNodes(pathNodes, true);

      return { diagnostic };
    },
    [injectPathNodes, navigateToNodes],
  );

  return { navigateToTaxon };
}
