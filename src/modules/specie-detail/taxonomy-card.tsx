import { useGetParents } from "@/hooks/queries/useGetParents";
import { RANK_FIXES } from "@/common/utils/tree/ranks";
import { setExpandedPathAtom } from "@/store/tree";
import { useSetAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { SpecieDetail } from "@/common/types/api";
import type { PathNode } from "@/common/types/tree-atoms";
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
  const navigate = useNavigate();
  const setExpandedPath = useSetAtom(setExpandedPathAtom);

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

  const navigateToTaxon = useCallback(
    (targetKey: number) => {
      const pathNodes = buildPathUpTo(targetKey);
      setExpandedPath(pathNodes);
      const keys = pathNodes.map((n) => n.key).join("/");
      void navigate({ to: `/tree/${keys}` });
    },
    [buildPathUpTo, navigate, setExpandedPath],
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
    setExpandedPath(pathNodes);
    const keys = pathNodes.map((n) => n.key).join("/");
    void navigate({ to: `/tree/${keys}` });
  }, [parents, specieKey, specieDetail, navigate, setExpandedPath]);

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
                  className="text-primary mt-0.5 text-sm font-semibold hover:underline focus:outline-none"
                >
                  {value}
                </button>
              ) : (
                <dd className="text-foreground mt-0.5 text-sm font-semibold">
                  {value}
                </dd>
              )}
            </div>
          );
        })}
      </dl>

      {showViewInTree && (
        <button
          onClick={navigateToSpecies}
          className="text-primary mt-4 flex items-center gap-1 text-xs font-medium hover:underline focus:outline-none"
        >
          {t("specieDetail.viewInTree")}
          <ChevronRight className="size-3" />
        </button>
      )}
    </div>
  );
};
