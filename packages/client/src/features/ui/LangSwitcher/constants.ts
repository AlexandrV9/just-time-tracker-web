import enFlag from "~/shared/assets/images/lang/en.png";
import ruFlag from "~/shared/assets/images/lang/ru.png";
import zhFlag from "~/shared/assets/images/lang/zh.png";

export const LANGUAGES = {
  en: "en",
  ru: "ru",
  zh: "zh",
} as const;

export type Language = keyof typeof LANGUAGES;

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: enFlag,
  ru: ruFlag,
  zh: zhFlag,
};
