import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import { SourceReference } from "@/common/components/source-info/source-reference";
import type { VernacularName } from "@/common/types/api";
import {
  extractHighConfidenceWikipediaCommonNames,
  getBaseLanguage,
  selectPrimaryCommonNames,
} from "@/common/utils/common-names";
import { useGetSpecieDetail } from "@/hooks/queries/useGetSpecieDetail";
import { useGetSpeciesCache } from "@/hooks/queries/useGetSpeciesCache";
import { useGetVernacularNames } from "@/hooks/queries/useGetVernacularNames";
import {
  SkeletonDescription,
  SkeletonText,
} from "@/modules/specie-detail/skeletons";
import { selectedSpecieKeyAtom, treeAtom } from "@/store/tree";

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

function CommonNamesSources({ names }: { names: VernacularName[] }) {
  const hasWikipedia = names.some((name) => name.source === "Wikipedia");
  const hasGbif = names.some((name) => name.source !== "Wikipedia");
  const sources = [
    hasWikipedia ? (
      <SourceReference key="wikipedia" sourceId="wikipedia">
        Wikipedia
      </SourceReference>
    ) : null,
    hasGbif ? (
      <SourceReference key="gbif" sourceId="gbif">
        GBIF
      </SourceReference>
    ) : null,
  ].filter(Boolean);

  return sources.map((source, index) => (
    <span key={index}>
      {index > 0 && ", "}
      {source}
    </span>
  ));
}

function CommonNamesBlock({
  names,
  isLoading,
  t,
}: {
  names: VernacularName[];
  isLoading: boolean;
  t: (key: string) => string;
}) {
  if (!isLoading && names.length === 0) return null;

  return (
    <div className="space-y-2 border-t pt-4">
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {t("specieDetail.commonNamesTitle")}
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          <SkeletonText />
        </div>
      ) : (
        <>
          <ul className="flex flex-wrap gap-2">
            {names.map((name) => (
              <li
                key={`${name.language}-${name.vernacularName}`}
                className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-sm"
              >
                {name.vernacularName}
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground text-xs">
            {t("specieDetail.sources")}:{" "}
            <CommonNamesSources names={names} />
          </p>
        </>
      )}
    </div>
  );
}

export const SpecieInfos = () => {
  const { t, i18n } = useTranslation();
  const selectedKey = useAtomValue(selectedSpecieKeyAtom);
  const treeSpecieKey = useAtomValue(treeAtom.expandedNodes).find(
    (node) => node.rank === "SPECIES",
  )?.key;

  const specieKey = selectedKey ?? treeSpecieKey;

  const { data: specieDetail, isLoading } = useGetSpecieDetail({
    specieKey,
  });

  const canonicalName =
    specieDetail?.canonicalName || specieDetail?.scientificName;
  const descriptionLanguage = i18n.resolvedLanguage ?? i18n.language;

  const { data: cache, isLoading: isLoadingCache } = useGetSpeciesCache(
    specieKey,
    canonicalName,
    specieDetail?.genus,
    specieDetail?.family,
  );

  const { data: vernacularNames = [], isLoading: isLoadingVernacularNames } =
    useGetVernacularNames(specieKey, canonicalName, descriptionLanguage);

  const wikipediaCommonNames = useMemo(() => {
    const language = getBaseLanguage(
      cache?.wikiDetails?.language,
      getBaseLanguage(descriptionLanguage, "pt"),
    );
    const names = extractHighConfidenceWikipediaCommonNames({
      title: cache?.wikiDetails?.title,
      extractHtml: cache?.wikiDetails?.extractHtml,
      extract: cache?.wikiDetails?.extract,
      description: cache?.wikiDetails?.description,
      language,
      canonicalName,
    });

    return names.map((name) => ({
      vernacularName: name,
      language,
      source: "Wikipedia",
    }));
  }, [cache, canonicalName, descriptionLanguage]);

  const selectedCommonNames = useMemo(() => {
    const reliableWikipediaNames = selectPrimaryCommonNames(
      wikipediaCommonNames,
      canonicalName,
      descriptionLanguage,
      { maxPerLanguage: 3 },
    );

    if (reliableWikipediaNames.length > 0) {
      return reliableWikipediaNames;
    }

    return selectPrimaryCommonNames(
      vernacularNames,
      canonicalName,
      descriptionLanguage,
    );
  }, [canonicalName, descriptionLanguage, vernacularNames, wikipediaCommonNames]);

  const isLoadingCommonNames =
    isLoadingCache ||
    (wikipediaCommonNames.length === 0 && isLoadingVernacularNames);

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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CommonNamesBlock
          names={selectedCommonNames}
          isLoading={isLoadingCommonNames}
          t={t}
        />
      </motion.div>

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
              <SourceReference sourceId="gbif">GBIF</SourceReference>,{" "}
              <SourceReference sourceId="wikipedia">Wikipedia</SourceReference>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
