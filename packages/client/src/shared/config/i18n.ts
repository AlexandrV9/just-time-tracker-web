import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { I18_LANG_KEY } from "../constants";

const initI18n = i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    debug: false,
    supportedLngs: ["en", "ru", "zh"],
    fallbackLng: "en",
    nonExplicitSupportedLngs: true,
    // lng: "en", // Default language
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // Path to load translations
    },
    defaultNS: ["translation"],
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupQuerystring: "lng",
      lookupLocalStorage: I18_LANG_KEY,
      convertDetectedLanguage: (lng) => {
        return lng.split("-")[0].toLowerCase();
      },
      htmlTag: document.documentElement,
    },
  });

export { i18n, initI18n };

i18n.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
});
