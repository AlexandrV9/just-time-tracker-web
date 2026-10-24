import { LANGUAGES, type Language } from "./constants";

export const isSupportedLanguage = (lng: string): lng is Language =>
  lng in LANGUAGES;
