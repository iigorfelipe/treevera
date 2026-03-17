import { useGetSpeciesCache } from "@/hooks/queries/useGetSpeciesCache";
import {
  SkeletonDescription,
  SkeletonText,
} from "@/modules/specie-detail/skeletons";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useAtomValue } from "jotai";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const SpecieInfos = () => {
  const { t } = useTranslation();
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const specieKey = selectedKey ?? treeSpecieKey;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey: specieKey!,
  });

  const canonicalName =
    specieDetail?.canonicalName || specieDetail?.scientificName;

  const { data: cache, isLoading: isLoadingCache } = useGetSpeciesCache(
    specieKey,
    canonicalName,
  );

  if (!specieDetail)
    return (
      <p className="text-muted-foreground text-center">
        {t("specieDetail.dataUnavailable")}
      </p>
    );

  if (isLoading) return <SkeletonText />;

  return (
    <div className="space-y-5">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-0.5 font-serif text-3xl font-bold italic sm:text-4xl">
          {specieDetail.canonicalName}
        </h1>
        {specieDetail.scientificName && (
          <p className="text-muted-foreground text-sm sm:text-base">
            {specieDetail.scientificName}
          </p>
        )}
      </motion.header>

      {isLoadingCache ? (
        <SkeletonDescription />
      ) : cache?.wikiDetails?.extract || cache?.wikiDetails?.description ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("specieDetail.descriptionTitle")}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {cache.wikiDetails.extract || cache.wikiDetails.description}
          </p>
        </motion.div>
      ) : null}

      {(specieDetail.authorship || specieDetail.publishedIn) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 border-t pt-4"
        >
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("specieDetail.nomenclatureTitle")}
          </h3>
          <div className="space-y-1 text-sm">
            {specieDetail.authorship && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">
                  {t("specieDetail.author")}:{" "}
                </strong>
                {specieDetail.authorship}
              </p>
            )}
            {specieDetail.publishedIn && (
              <p className="text-muted-foreground">
                <strong className="text-foreground">
                  {t("specieDetail.publishedIn")}:{" "}
                </strong>
                {specieDetail.publishedIn}
              </p>
            )}
            <p className="text-muted-foreground">
              <strong className="text-foreground">
                {t("specieDetail.sources")}:{" "}
              </strong>
              GBIF, Wikipedia
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
