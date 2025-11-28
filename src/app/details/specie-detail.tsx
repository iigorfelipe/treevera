import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { SpecieImageDetail } from "@/modules/specie-detail/image";
import { SpecieInfos } from "@/modules/specie-detail/infos";
import {
  SkeletonTaxonomy,
  SkeletonText,
} from "@/modules/specie-detail/skeletons";
import { treeAtom } from "@/store/tree";
import { useAtomValue } from "jotai";
import { OccurrenceMap } from "@/modules/specie-detail/occurrences-map";

export const SpecieDetail = () => {
  const specieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  if (isLoading) {
    return (
      <>
        <SkeletonText />
        <SkeletonTaxonomy />
      </>
    );
  }

  if (!specieDetail) return <p>Nenhum dado foi encontrado</p>;

  return (
    <div style={{ containerType: "inline-size" }}>
      <div className="m-4 mt-28 grid grid-cols-1 gap-6 py-4 pr-px pl-4 md:mt-4 [@container(min-width:820px)]:grid-cols-2">
        <SpecieInfos />
        <div className="flex flex-col gap-6">
          <SpecieImageDetail />
          {specieKey && <OccurrenceMap specieKey={specieKey} />}
        </div>
      </div>
    </div>
  );
};
