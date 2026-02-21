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
import { useTranslation } from "react-i18next";

export const SpecieDetail = ({ embedded = false }: { embedded?: boolean }) => {
  const { t } = useTranslation();
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
        <p className="text-muted-foreground">{t("specieDetail.notFound")}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={embedded ? undefined : "h-full overflow-auto"}
      style={{ containerType: "inline-size" }}
    >
      {isFromGallery && !embedded && (
        <div className="bg-card/95 sticky top-0 z-10 border-b px-4 py-3 shadow-sm backdrop-blur-sm">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            {t("specieDetail.backToGallery")}
          </Button>
        </div>
      )}

      <div className={`p-4 ${isFromGallery ? "pt-6" : embedded ? "pt-2" : "mt-28 md:mt-4"}`}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border p-6 shadow-lg"
          >
            <SpecieInfos />
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card overflow-hidden rounded-xl border shadow-lg"
            >
              <SpecieImageDetail />
            </motion.div>

            {specieKey && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
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
