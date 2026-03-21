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
import { useState } from "react";

const DESCRIPTION_LIMIT = 300;

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function DescriptionBlock({
  speciesText,
  genusText,
  t,
}: {
  speciesText: string;
  genusText: string;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  const isDuplicate =
    speciesText && genusText && normalize(speciesText) === normalize(genusText);

  const showSpecies = speciesText && !isDuplicate;
  const showGenus = !!genusText;

  if (!showSpecies && !showGenus) return null;

  let fullLength = 0;
  if (showSpecies) fullLength += speciesText.length;
  if (showGenus) fullLength += genusText.length;

  const needsTruncation = fullLength > DESCRIPTION_LIMIT;
  const isCollapsed = !expanded && needsTruncation;

  let speciesDisplayed = showSpecies ? speciesText : "";
  let genusDisplayed = showGenus ? genusText : "";

  if (isCollapsed) {
    let remaining = DESCRIPTION_LIMIT;

    if (showSpecies) {
      if (speciesText.length <= remaining) {
        speciesDisplayed = speciesText;
        remaining -= speciesText.length;
      } else {
        speciesDisplayed = speciesText.slice(0, remaining) + "...";
        remaining = 0;
      }
    }

    if (showGenus) {
      if (remaining <= 0) {
        genusDisplayed = "";
      } else if (genusText.length <= remaining) {
        genusDisplayed = genusText;
      } else {
        genusDisplayed = genusText.slice(0, remaining) + "...";
      }
    }
  }

  return (
    <div className="space-y-3">
      {showSpecies && speciesDisplayed && (
        <div className="space-y-1">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("specieDetail.descriptionTitle")}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {speciesDisplayed}
          </p>
        </div>
      )}

      {showGenus && genusDisplayed && (
        <div className="space-y-1">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {t("specieDetail.genusDescriptionTitle")}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {genusDisplayed}
          </p>
        </div>
      )}

      {needsTruncation && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-primary text-xs font-medium hover:underline"
        >
          {expanded ? t("specieDetail.showLess") : t("specieDetail.showMore")}
        </button>
      )}
    </div>
  );
}

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
    specieDetail?.genus,
    specieDetail?.family,
  );

  if (!specieDetail)
    return (
      <p className="text-muted-foreground text-center">
        {t("specieDetail.dataUnavailable")}
      </p>
    );

  if (isLoading) return <SkeletonText />;

  const speciesText =
    cache?.wikiDetails?.extract || cache?.wikiDetails?.description || "";
  const genusText =
    cache?.genusDetails?.extract || cache?.genusDetails?.description || "";

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
      ) : speciesText || genusText ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DescriptionBlock
            speciesText={speciesText}
            genusText={genusText}
            t={t}
          />
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
