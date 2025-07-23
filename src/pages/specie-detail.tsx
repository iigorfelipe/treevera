import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { SpecieImageDetail } from "@/modules/specie-detail/image";
import { SpecieInfos } from "@/modules/specie-detail/infos";
import {
  SkeletonTaxonomy,
  SkeletonText,
} from "@/modules/specie-detail/skeletons";
import { specieKeyAtom } from "@/store/tree";
import { useAtomValue } from "jotai";

export const SpecieDetail = () => {
  const specieKey = useAtomValue(specieKeyAtom);

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
  if (!specieDetail) return <p>Nnehuma dado foi encontrado</p>;

  return (
    <div className="h-full w-full rounded-3xl border border-gray-200 bg-white py-4 pr-[1px] pl-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
      <div className="h-full w-full overflow-auto">
        <div className="grid grid-cols-1 gap-6 pr-2 md:grid-cols-2">
          <SpecieInfos specieDetail={specieDetail} />
          <SpecieImageDetail specieDetail={specieDetail} />
        </div>
      </div>
    </div>
  );
};
