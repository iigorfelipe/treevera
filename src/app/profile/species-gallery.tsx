import { useAtomValue } from "jotai";
import { SpeciesGallery } from "@/modules/species-gallery/species-gallery";
import { SpecieDetail } from "@/app/details/specie-detail";
import { motion, AnimatePresence } from "framer-motion";
import { selectedSpecieKeyAtom } from "@/store/tree";

export const SpeciesGalleryPage = () => {
  const selectedSpecieKey = useAtomValue(selectedSpecieKeyAtom);

  return (
    <AnimatePresence mode="wait">
      {selectedSpecieKey === null ? (
        <motion.div
          key="gallery"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <SpeciesGallery />
        </motion.div>
      ) : (
        <motion.div
          key="detail"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <SpecieDetail />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
