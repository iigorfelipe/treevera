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
import { useMemo, useState } from "react";
import { SourceReference } from "@/common/components/source-info/source-reference";
import type { VernacularName } from "@/common/types/api";

const DESCRIPTION_LIMIT = 300;
const LANGUAGE_ALIASES: Record<string, string> = {
  por: "pt",
  eng: "en",
  spa: "es",
  esp: "es",
};

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

function getBaseLanguage(language?: string, fallback = "") {
  const base = language?.toLowerCase().split("-")[0] ?? fallback;
  return LANGUAGE_ALIASES[base] ?? base;
}

function normalizeComparable(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .trim()
    .toLowerCase();
}

function cleanCommonNameCandidate(value: string) {
  return value
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/["“”'.,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidCommonNameCandidate(candidate: string, canonicalName?: string) {
  const clean = cleanCommonNameCandidate(candidate);
  if (clean.length < 3 || clean.length > 80) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(clean)) return false;
  if (canonicalName) {
    const normalizedCandidate = normalizeComparable(clean);
    const normalizedCanonical = normalizeComparable(canonicalName);
    if (normalizedCandidate === normalizedCanonical) return false;
  }
  return true;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

function decodeHtmlEntities(value: string) {
  if (typeof document === "undefined") {
    return value
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function extractFirstBoldNameFromHtml(html: string, canonicalName?: string) {
  const matches = html.matchAll(/<b[^>]*>(.*?)<\/b>/gi);

  for (const match of matches) {
    const candidate = cleanCommonNameCandidate(
      decodeHtmlEntities(stripHtml(match[1] ?? "")),
    );

    if (isValidCommonNameCandidate(candidate, canonicalName)) {
      return candidate;
    }
  }

  return null;
}

function getPrimaryNameCandidate(value: string, language: string) {
  const withoutArticle = value
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      language === "en"
        ? /^(?:the|a|an)\s+/i
        : language === "es"
          ? /^(?:el|la|los|las|un|una)\s+/i
          : /^(?:o|a|os|as|um|uma)\s+/i,
      "",
    );

  return cleanCommonNameCandidate(
    withoutArticle.split(
      /\s*(?:,|;|\(|\bou\b|\btamb[eé]m\b|\balso\b|\bor\b|\btambi[eé]n\b|\bo\b)\s*/i,
    )[0] ?? "",
  );
}

function extractNameFromDescription(text: string, language: string) {
  const firstSentence = text.replace(/\s+/g, " ").trim().split(/[.!?]/)[0];
  if (!firstSentence) return null;

  const verbPattern =
    language === "en"
      ? /\s+(?:is|are)\s+/i
      : language === "es"
        ? /\s+(?:es|son)\s+/i
        : /\s+(?:é|e|são|sao)\s+/i;
  const beforeVerb = firstSentence.split(verbPattern)[0] ?? firstSentence;
  const primaryCandidate = getPrimaryNameCandidate(beforeVerb, language);
  if (primaryCandidate) return primaryCandidate;

  const patterns =
    language === "en"
      ? [
          /^(?:the)\s+(.+?)\s+(?:is|are)\s+/i,
          /^[^,]+,\s*(?:the|a|an)\s+(.+?),\s+(?:is|are)\s+/i,
        ]
      : language === "es"
        ? [/^(?:el|la|los|las)\s+(.+?)\s+(?:es|son)\s+/i]
        : [/^(?:o|a|os|as)\s+(.+?)\s+(?:é|e|são|sao)\s+/i];

  for (const pattern of patterns) {
    const match = firstSentence.match(pattern);
    const candidate = match?.[1] ? cleanCommonNameCandidate(match[1]) : "";
    if (candidate) return candidate;
  }

  return null;
}

function getLocalizedDescriptionName({
  title,
  extractHtml,
  text,
  canonicalName,
  currentLanguage,
  sourceLanguage,
}: {
  title?: string;
  extractHtml?: string;
  text: string;
  canonicalName?: string;
  currentLanguage: string;
  sourceLanguage?: string;
}) {
  const language = getBaseLanguage(currentLanguage, "pt");
  const resolvedSourceLanguage = getBaseLanguage(sourceLanguage, language);
  if (resolvedSourceLanguage !== language && resolvedSourceLanguage !== "en") {
    return null;
  }

  const titleCandidate = title ? cleanCommonNameCandidate(title) : "";

  if (
    titleCandidate &&
    isValidCommonNameCandidate(titleCandidate, canonicalName)
  ) {
    return titleCandidate;
  }

  const htmlCandidate = extractHtml
    ? extractFirstBoldNameFromHtml(extractHtml, canonicalName)
    : null;

  if (htmlCandidate) {
    return htmlCandidate;
  }

  const descriptionCandidate = extractNameFromDescription(
    text,
    resolvedSourceLanguage,
  );
  if (
    descriptionCandidate &&
    isValidCommonNameCandidate(descriptionCandidate, canonicalName)
  ) {
    return descriptionCandidate;
  }

  return null;
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
            <SourceReference sourceId="wikipedia">Wikipedia</SourceReference>
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

  const { data: cache, isLoading: isLoadingCache } = useGetSpeciesCache(
    specieKey,
    canonicalName,
    specieDetail?.genus,
    specieDetail?.family,
  );

  const descriptionLanguage = i18n.resolvedLanguage ?? i18n.language;
  const localizedDescriptionName = useMemo(() => {
    const language = getBaseLanguage(
      cache?.wikiDetails?.language,
      getBaseLanguage(descriptionLanguage, "pt"),
    );
    const name = getLocalizedDescriptionName({
      title: cache?.wikiDetails?.title,
      extractHtml: cache?.wikiDetails?.extractHtml,
      text:
        cache?.wikiDetails?.extract || cache?.wikiDetails?.description || "",
      canonicalName,
      currentLanguage: descriptionLanguage,
      sourceLanguage: cache?.wikiDetails?.language,
    });

    return name
      ? {
          vernacularName: name,
          language,
          source: "Wikipedia",
        }
      : null;
  }, [cache, canonicalName, descriptionLanguage]);

  const selectedCommonNames = useMemo(
    () => (localizedDescriptionName ? [localizedDescriptionName] : []),
    [localizedDescriptionName],
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <CommonNamesBlock
          names={selectedCommonNames}
          isLoading={isLoadingCache}
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
