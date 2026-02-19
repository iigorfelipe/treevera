import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { SpecieImageDetail } from "@/modules/specie-detail/image";
import { SpecieInfos } from "@/modules/specie-detail/infos";
import {
  SkeletonTaxonomy,
  SkeletonText,
} from "@/modules/specie-detail/skeletons";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { useAtomValue, useSetAtom } from "jotai";
import { OccurrenceMap } from "@/modules/specie-detail/occurrences-map";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { motion } from "framer-motion";

export const SpecieDetail = () => {
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const setSelectedKey = useSetAtom(selectedSpecieKeyAtom);

  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const specieKey = selectedKey ?? treeSpecieKey;
  const isFromGallery = selectedKey !== null;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  const handleBack = () => {
    setSelectedKey(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonText />
        <SkeletonTaxonomy />
      </div>
    );
  }

  if (!specieDetail) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-600">Nenhum dado foi encontrado</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-auto"
      style={{ containerType: "inline-size" }}
    >
      {isFromGallery && (
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Voltar para galeria
          </Button>
        </div>
      )}

      <div className={`p-4 ${isFromGallery ? "pt-6" : "mt-28 md:mt-4"}`}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
          >
            <SpecieInfos />
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <SpecieImageDetail />
            </motion.div>

            {specieKey && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <OccurrenceMap specieKey={specieKey} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
