import { useGetParents } from "@/hooks/queries/useGetParents";
import { RANK_FIXES } from "@/common/utils/tree/ranks";
import { injectPathNodesAtom } from "@/store/tree";
import { useSetAtom } from "jotai";
import { ChevronLeft, ListTree } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTreeNavigation } from "@/hooks/use-tree-navigation";
import type { SpecieDetail } from "@/common/types/api";
import type { NodeEntity, PathNode } from "@/common/types/tree-atoms";
import type { Taxon } from "@/common/types/api";

type Props = {
  specieDetail: SpecieDetail;
  specieKey: number;
  showViewInTree?: boolean;
};

export const TaxonomyCard = ({
  specieDetail,
  specieKey,
  showViewInTree = true,
}: Props) => {
  const { t } = useTranslation();
  const injectPathNodes = useSetAtom(injectPathNodesAtom);
  const { navigateToNodes } = useTreeNavigation();

  const { data: parents = [], isLoading } = useGetParents(specieKey, true);

  const isOrderClass = RANK_FIXES[specieDetail.class];

  const taxonomyFields: { label: string; value: string; rank: string }[] = [
    {
      label: t("specieDetail.kingdomLabel"),
      value: specieDetail.kingdom,
      rank: "KINGDOM",
    },
    {
      label: t("specieDetail.phylumLabel"),
      value: specieDetail.phylum,
      rank: "PHYLUM",
    },
    {
      label: isOrderClass
        ? t("specieDetail.orderLabel")
        : t("specieDetail.classLabel"),
      value: specieDetail.class,
      rank: isOrderClass ? "ORDER" : "CLASS",
    },
    ...(isOrderClass
      ? []
      : [
          {
            label: t("specieDetail.orderLabel"),
            value: specieDetail.order ?? "",
            rank: "ORDER",
          },
        ]),
    {
      label: t("specieDetail.familyLabel"),
      value: specieDetail.family ?? "",
      rank: "FAMILY",
    },
    {
      label: t("specieDetail.genusLabel"),
      value: specieDetail.genus ?? "",
      rank: "GENUS",
    },
  ].filter((f) => !!f.value);

  const getParentKey = (rank: string): number | undefined => {
    const match = parents.find(
      (p: Taxon) => p.rank?.toUpperCase() === rank.toUpperCase(),
    );
    return match?.key;
  };

  const buildPathUpTo = useCallback(
    (targetKey: number): PathNode[] => {
      const path: PathNode[] = [];
      for (const p of parents) {
        path.push({
          key: p.key,
          rank: p.rank,
          name: p.canonicalName || p.scientificName || "",
        });
        if (p.key === targetKey) break;
      }
      return path;
    },
    [parents],
  );

  const buildEntities = useCallback(
    (pathNodes: PathNode[]): NodeEntity[] =>
      pathNodes.map((pn, i) => {
        const parent = parents.find((p) => p.key === pn.key);
        return {
          key: pn.key,
          rank: pn.rank,
          numDescendants:
            parent?.numDescendants ?? (pn.rank === "SPECIES" ? 0 : 1),
          canonicalName: pn.name || undefined,
          kingdom: specieDetail.kingdom,
          parentKey: i > 0 ? pathNodes[i - 1].key : undefined,
        };
      }),
    [parents, specieDetail.kingdom],
  );

  const navigateToTaxon = useCallback(
    (targetKey: number) => {
      const pathNodes = buildPathUpTo(targetKey);
      injectPathNodes(buildEntities(pathNodes));
      navigateToNodes(pathNodes, true);
    },
    [buildPathUpTo, buildEntities, injectPathNodes, navigateToNodes],
  );

  const navigateToSpecies = useCallback(() => {
    const pathNodes: PathNode[] = [
      ...parents.map((p: Taxon) => ({
        key: p.key,
        rank: p.rank,
        name: p.canonicalName || p.scientificName || "",
      })),
      {
        key: specieKey,
        rank: "SPECIES" as const,
        name: specieDetail.canonicalName || specieDetail.scientificName || "",
      },
    ];
    injectPathNodes(buildEntities(pathNodes));
    navigateToNodes(pathNodes, true);
  }, [
    parents,
    specieKey,
    specieDetail,
    buildEntities,
    injectPathNodes,
    navigateToNodes,
  ]);

  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm">
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        {t("specieDetail.taxonomyTitle")}
      </h3>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {taxonomyFields.map(({ label, value, rank }) => {
          const parentKey = isLoading ? undefined : getParentKey(rank);
          const isClickable = !isLoading && parentKey !== undefined;

          return (
            <div key={label}>
              <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                {label}
              </dt>
              {isClickable ? (
                <button
                  onClick={() => navigateToTaxon(parentKey!)}
                  className="text-primary mt-0.5 cursor-pointer text-left text-sm leading-tight font-semibold wrap-break-word hover:underline focus:outline-none"
                >
                  {value}
                </button>
              ) : (
                <dd className="text-foreground mt-0.5 text-sm leading-tight font-semibold wrap-break-word">
                  {value}
                </dd>
              )}
            </div>
          );
        })}
      </dl>

      {showViewInTree && (
        <button
          type="button"
          onClick={navigateToSpecies}
          disabled={isLoading}
          className="border-border bg-muted/40 text-primary hover:bg-muted mt-4 flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-60"
        >
          <span className="flex min-w-0 items-center gap-2">
            <ListTree className="size-4 shrink-0" />
            <span className="truncate">{t("specieDetail.viewInTree")}</span>
          </span>
          <ChevronLeft className="size-4 shrink-0" />
        </button>
      )}
    </div>
  );
};
