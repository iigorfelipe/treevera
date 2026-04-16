import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import pt from "./locales/pt/translation.json";
import es from "./locales/es/translation.json";

const LANG_MAP: Record<string, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

function syncHtmlLang(lng: string) {
  const base = lng.split("-")[0];
  document.documentElement.lang = LANG_MAP[base] ?? lng;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "pt",
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
    },
  });

syncHtmlLang(i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
