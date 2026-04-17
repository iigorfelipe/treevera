import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const LANG_MAP: Record<string, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

const translationLoaders = {
  pt: () => import("./locales/pt/translation.json"),
  en: () => import("./locales/en/translation.json"),
  es: () => import("./locales/es/translation.json"),
} as const;

type SupportedLanguage = keyof typeof translationLoaders;

const loadedLanguages = new Set<SupportedLanguage>();
const pendingLoads = new Map<SupportedLanguage, Promise<void>>();

function getBaseLanguage(lng?: string | null): SupportedLanguage {
  const base = lng?.toLowerCase().split("-")[0];
  if (base === "en" || base === "es") return base;
  return "pt";
}

function syncHtmlLang(lng: string) {
  const base = getBaseLanguage(lng);
  document.documentElement.lang = LANG_MAP[base] ?? lng;
}

async function loadLanguage(baseLanguage: SupportedLanguage) {
  if (loadedLanguages.has(baseLanguage)) return;

  const pending = pendingLoads.get(baseLanguage);
  if (pending) {
    await pending;
    return;
  }

  const loadPromise = translationLoaders[baseLanguage]()
    .then((module) => {
      i18n.addResourceBundle(
        baseLanguage,
        "translation",
        module.default,
        true,
        true,
      );
      loadedLanguages.add(baseLanguage);
    })
    .finally(() => {
      pendingLoads.delete(baseLanguage);
    });

  pendingLoads.set(baseLanguage, loadPromise);
  await loadPromise;
}

async function loadInitialResources(language: string) {
  const baseLanguage = getBaseLanguage(language);
  const languagesToLoad: SupportedLanguage[] =
    baseLanguage === "pt" ? ["pt"] : ["pt", baseLanguage];

  const loadedResources = await Promise.all(
    languagesToLoad.map(async (lng) => {
      const module = await translationLoaders[lng]();
      loadedLanguages.add(lng);

      return [
        lng,
        {
          translation: module.default,
        },
      ] as const;
    }),
  );

  return Object.fromEntries(loadedResources);
}

async function ensureLanguageLoaded(language: string) {
  const baseLanguage = getBaseLanguage(language);

  await loadLanguage("pt");

  if (baseLanguage !== "pt") {
    await loadLanguage(baseLanguage);
  }
}

const languageDetector = new LanguageDetector();
languageDetector.init();

const detectedLanguage = languageDetector.detect();
const initialLanguage = getBaseLanguage(
  Array.isArray(detectedLanguage) ? detectedLanguage[0] : detectedLanguage,
);

export const i18nReady = (async () => {
  const resources = await loadInitialResources(initialLanguage);

  await i18n.use(languageDetector).use(initReactI18next).init({
    lng: initialLanguage,
    resources,
    fallbackLng: "pt",
    supportedLngs: ["pt", "en", "es"],
    load: "languageOnly",
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
  });

  syncHtmlLang(i18n.language);
  i18n.on("languageChanged", syncHtmlLang);

  const originalChangeLanguage = i18n.changeLanguage.bind(i18n);

  i18n.changeLanguage = (async (lng, callback) => {
    const nextLanguage = typeof lng === "string" ? lng : initialLanguage;
    await ensureLanguageLoaded(nextLanguage);
    return originalChangeLanguage(nextLanguage, callback);
  }) as typeof i18n.changeLanguage;

  return i18n;
})();

export default i18n;
