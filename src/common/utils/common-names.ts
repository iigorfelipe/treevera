import type { VernacularName } from "@/common/types/api";

const SUPPORTED_LANGUAGES = ["pt", "en", "es"] as const;

const LANGUAGE_ALIASES: Record<string, string> = {
  por: "pt",
  eng: "en",
  spa: "es",
  esp: "es",
};

const INVALID_PHRASES = [
  " is a ",
  " is an ",
  " are a ",
  " are an ",
  " known as ",
  " commonly known ",
  " popularly known ",
  " species of ",
  " genus of ",
  " family of ",
  " endemic to ",
  " found in ",
  " described by ",
  " e uma ",
  " e um ",
  " conhecido como ",
  " conhecida como ",
  " conhecidos como ",
  " conhecidas como ",
  " popularmente conhecido ",
  " popularmente conhecida ",
  " chamado de ",
  " chamada de ",
  " sao uma ",
  " sao um ",
  " especie de ",
  " genero de ",
  " familia de ",
  " endemico de ",
  " endemica de ",
  " ocorre em ",
  " es una ",
  " es un ",
  " conocido como ",
  " conocida como ",
  " conocidos como ",
  " conocidas como ",
  " popularmente conocido ",
  " popularmente conocida ",
  " llamado de ",
  " llamada de ",
  " son una ",
  " son un ",
  " especie de ",
  " genero de ",
  " familia de ",
  " endemico de ",
  " endemica de ",
];

const INVALID_EXACT_NAMES = new Set([
  "species",
  "specie",
  "especie",
  "genus",
  "genero",
  "family",
  "familia",
  "animal",
  "plant",
  "planta",
  "popularmente",
  "vulgarmente",
  "commonly",
  "popularly",
  "known",
  "called",
  "also",
  "only",
  "just",
  "simply",
  "apenas",
  "somente",
  "simplesmente",
  "tambem",
  "tamb\u00e9m",
  "conhecido",
  "conhecida",
  "chamado",
  "chamada",
  "conocido",
  "conocida",
  "llamado",
  "llamada",
]);

export function getBaseLanguage(language?: string, fallback = "") {
  const base = language?.toLowerCase().split("-")[0] ?? fallback;
  return LANGUAGE_ALIASES[base] ?? base;
}

export function normalizeComparable(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

export function cleanCommonNameCandidate(value: string) {
  return value
    .replace(/\s*\([^)]*\)/g, "")
    .replace(
      /^(?:also\s+)?(?:(?:commonly|popularly)\s+)?(?:known\s+as|called|named)\s+/i,
      "",
    )
    .replace(
      /^(?:tamb(?:e|\u00e9)m\s+)?(?:conhecid[oa]s?|chamad[oa]s?|denominad[oa]s?)(?:\s+(?:popularmente|vulgarmente|apenas|somente|simplesmente))*\s+(?:como|por|de)\s+/i,
      "",
    )
    .replace(
      /^(?:tamb(?:e|\u00e9)m\s+)?(?:conhecid[oa]s?|chamad[oa]s?|denominad[oa]s?)\s+/i,
      "",
    )
    .replace(
      /^(?:tamb(?:e|\u00e9)m\s+)?(?:popularmente|vulgarmente|apenas|somente|simplesmente)(?:\s+(?:conhecid[oa]s?|chamad[oa]s?|denominad[oa]s?))?\s*(?:como|por|de)?\s*/i,
      "",
    )
    .replace(
      /^(?:tambi(?:e|\u00e9)n\s+)?(?:conocid[oa]s?|llamad[oa]s?|denominad[oa]s?)(?:\s+(?:popularmente|solo|solamente|simplemente))*\s+(?:como|por|de)\s+/i,
      "",
    )
    .replace(
      /^(?:tambi(?:e|\u00e9)n\s+)?(?:conocid[oa]s?|llamad[oa]s?|denominad[oa]s?)\s+/i,
      "",
    )
    .replace(
      /^(?:tambi(?:e|\u00e9)n\s+)?(?:popularmente|solo|solamente|simplemente)(?:\s+(?:conocid[oa]s?|llamad[oa]s?|denominad[oa]s?))?\s*(?:como|por|de)?\s*/i,
      "",
    )
    .replace(/["\u201c\u201d'.,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

export function isValidCommonNameCandidate(
  candidate: string,
  canonicalName?: string,
  options: { language?: string; strictPortugueseSpacing?: boolean } = {},
) {
  const clean = cleanCommonNameCandidate(candidate);
  if (clean.length < 3 || clean.length > 80) return false;

  const normalizedCandidate = normalizeComparable(clean);
  if (!/[a-z]/i.test(normalizedCandidate)) return false;
  if (INVALID_EXACT_NAMES.has(normalizedCandidate)) return false;
  if (normalizedCandidate.split(/\s+/).length > 8) return false;

  const paddedCandidate = ` ${normalizedCandidate} `;
  if (INVALID_PHRASES.some((phrase) => paddedCandidate.includes(phrase))) {
    return false;
  }

  const base = getBaseLanguage(options.language);
  if (
    options.strictPortugueseSpacing &&
    base === "pt" &&
    normalizedCandidate.split(/\s+/).length > 1 &&
    !clean.includes("-")
  ) {
    return false;
  }

  if (canonicalName) {
    const normalizedCanonical = normalizeComparable(canonicalName);
    if (normalizedCandidate === normalizedCanonical) return false;
    if (normalizedCandidate.startsWith(`${normalizedCanonical} `)) return false;
  }

  return true;
}

function removeLeadingArticle(value: string, language?: string) {
  const base = getBaseLanguage(language, "pt");
  const articlePattern =
    base === "en"
      ? /^(?:the|a|an)\s+/i
      : base === "es"
        ? /^(?:el|la|los|las|un|una|unos|unas)\s+/i
        : /^(?:o|a|os|as|um|uma|uns|umas)\s+/i;

  return value.replace(articlePattern, "").trim();
}

function splitConjunctionAlternatives(
  value: string,
  language?: string,
  canonicalName?: string,
) {
  const base = getBaseLanguage(language, "pt");
  const conjunctionPattern =
    base === "en"
      ? /\s+and\s+/i
      : base === "es"
        ? /\s+y\s+/i
        : /\s+e\s+/i;
  const parts = value
    .split(conjunctionPattern)
    .map(cleanCommonNameCandidate)
    .filter(Boolean);

  if (parts.length < 2) return [value];

  const looksLikeHyphenatedAlternatives = parts.every(
    (part) =>
      part.includes("-") &&
      isValidCommonNameCandidate(part, canonicalName, {
        language: base,
        strictPortugueseSpacing: true,
      }),
  );

  return looksLikeHyphenatedAlternatives ? parts : [value];
}

function splitNameAlternatives(
  value: string,
  language?: string,
  canonicalName?: string,
) {
  const base = getBaseLanguage(language, "pt");
  const withoutParenthetical = value.replace(/\s*\([^)]*\)/g, " ");
  const separatorPattern =
    base === "en"
      ? /\s*(?:,|;|\bor\b|\balso\b|(?:(?:commonly|popularly)\s+)?\bknown as\b|\bcalled\b|\bnamed\b)\s*/i
      : base === "es"
        ? /\s*(?:,|;|\bo\b|\btambi(?:e|\u00e9)n\b|\bconocid[ao]s?(?:\s+popularmente)?\s+como\b|\bllamad[ao]s?\s+(?:como|de)\b)\s*/i
        : /\s*(?:,|;|\bou\b|\btamb(?:e|\u00e9)m\b|\bconhecid[ao]s?(?:\s+(?:popularmente|vulgarmente))?\s+como\b|\bchamad[ao]s?\s+(?:como|de)\b)\s*/i;

  return withoutParenthetical
    .split(separatorPattern)
    .map(cleanCommonNameCandidate)
    .map((candidate) => removeLeadingArticle(candidate, base))
    .map(cleanCommonNameCandidate)
    .flatMap((candidate) =>
      splitConjunctionAlternatives(candidate, base, canonicalName),
    )
    .filter(Boolean);
}

function extractNamesBeforeDefinitionVerb(
  text: string,
  canonicalName?: string,
  language?: string,
) {
  const firstSentence = text.replace(/\s+/g, " ").trim().split(/[.!?]/)[0];
  if (!firstSentence) return [];

  const base = getBaseLanguage(language, "pt");
  const verbPattern =
    base === "en"
      ? /\s+(?:is|are)\s+/i
      : base === "es"
        ? /\s+(?:es|son)\s+/i
        : /\s+(?:\u00e9|s\u00e3o|sao)\s+/i;

  const beforeVerb = firstSentence.split(verbPattern)[0] ?? "";
  if (!beforeVerb || beforeVerb === firstSentence) return [];

  return splitNameAlternatives(beforeVerb, base, canonicalName).filter(
    (candidate) =>
      isValidCommonNameCandidate(candidate, canonicalName, {
        language: base,
        strictPortugueseSpacing: true,
      }),
  );
}

function uniqueNames(names: string[]) {
  const seen = new Set<string>();

  return names.filter((name) => {
    const normalizedName = normalizeComparable(name);
    if (!normalizedName || seen.has(normalizedName)) return false;
    seen.add(normalizedName);
    return true;
  });
}

export function extractHighConfidenceWikipediaCommonName({
  title,
  extractHtml,
  extract,
  description,
  language,
  canonicalName,
}: {
  title?: string;
  extractHtml?: string;
  extract?: string;
  description?: string;
  language?: string;
  canonicalName?: string;
}) {
  return extractHighConfidenceWikipediaCommonNames({
    title,
    extractHtml,
    extract,
    description,
    language,
    canonicalName,
  })[0] ?? null;
}

export function extractHighConfidenceWikipediaCommonNames({
  title,
  extractHtml,
  extract,
  description,
  language,
  canonicalName,
}: {
  title?: string;
  extractHtml?: string;
  extract?: string;
  description?: string;
  language?: string;
  canonicalName?: string;
}) {
  const names: string[] = [];
  const titleCandidate = title ? cleanCommonNameCandidate(title) : "";

  if (
    titleCandidate &&
    isValidCommonNameCandidate(titleCandidate, canonicalName, { language })
  ) {
    names.push(titleCandidate);
  }

  const matches = extractHtml?.matchAll(/<b[^>]*>(.*?)<\/b>/gi) ?? [];
  for (const match of matches) {
    const candidate = cleanCommonNameCandidate(
      decodeHtmlEntities(stripHtml(match[1] ?? "")),
    );

    if (isValidCommonNameCandidate(candidate, canonicalName, { language })) {
      names.push(candidate);
    }
  }

  names.push(
    ...extractNamesBeforeDefinitionVerb(
      extract ?? description ?? "",
      canonicalName,
      language,
    ),
  );

  return uniqueNames(names);
}

function getLanguagePriority(language?: string, currentLanguage?: string) {
  const base = getBaseLanguage(language);
  const preferred = getBaseLanguage(currentLanguage, "pt");
  const languageOrder = Array.from(
    new Set([preferred, ...SUPPORTED_LANGUAGES]),
  );
  const index = languageOrder.indexOf(base);
  if (index !== -1) return index;
  return base ? languageOrder.length : languageOrder.length + 1;
}

function getSourcePriority(source?: string) {
  return source === "Wikipedia" ? 0 : 1;
}

export function selectPrimaryCommonNames(
  names: Array<VernacularName | null | undefined>,
  canonicalName?: string,
  currentLanguage?: string,
  options: { maxPerLanguage?: number } = {},
) {
  const seen = new Set<string>();
  const languageCounts = new Map<string, number>();
  const maxPerLanguage = options.maxPerLanguage ?? 1;

  return names
    .filter((name): name is VernacularName => !!name?.vernacularName)
    .map((name, index) => ({
      ...name,
      order: index,
      vernacularName: cleanCommonNameCandidate(name.vernacularName),
      language: getBaseLanguage(name.language),
      source: name.source || "GBIF",
    }))
    .filter((name) =>
      isValidCommonNameCandidate(name.vernacularName, canonicalName, {
        language: name.language,
      }),
    )
    .sort(
      (a, b) =>
        getLanguagePriority(a.language, currentLanguage) -
          getLanguagePriority(b.language, currentLanguage) ||
        getSourcePriority(a.source) - getSourcePriority(b.source) ||
        a.order - b.order,
    )
    .filter((name) => {
      const language = getBaseLanguage(name.language);
      if (!SUPPORTED_LANGUAGES.includes(language as "pt" | "en" | "es")) {
        return false;
      }

      const normalizedName = normalizeComparable(name.vernacularName);
      if (!normalizedName) return false;

      const key = normalizedName;
      if (seen.has(key)) return false;

      const languageCount = languageCounts.get(language) ?? 0;
      if (languageCount >= maxPerLanguage) return false;

      seen.add(key);
      languageCounts.set(language, languageCount + 1);
      return true;
    });
}
