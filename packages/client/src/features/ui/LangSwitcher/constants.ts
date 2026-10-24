import { createListCollection } from "@ark-ui/react";
import enFlag from "~/shared/assets/images/lang/en.png";
import ruFlag from "~/shared/assets/images/lang/ru.png";
import zhFlag from "~/shared/assets/images/lang/zh.png";

export const LANGUAGES = {
  en: "en",
  ru: "ru",
  zh: "zh",
} as const;

export type Language = keyof typeof LANGUAGES;

export const languageListCollection = createListCollection({
  items: Object.keys(LANGUAGES).map((item) => ({ label: item, value: item })),
});

export type LanguageConfig = {
  path: string;
  alt: string;
  englishName: string;
  nativeName: string;
};

export const LANGUAGES_CONFIG = {
  en: {
    path: enFlag,
    alt: "English flag",
    englishName: "English",
    nativeName: "English",
  },
  ru: {
    path: ruFlag,
    alt: "Russian flag",
    englishName: "Russian",
    nativeName: "Русский",
  },
  zh: {
    path: zhFlag,
    alt: "Chinese flag",
    englishName: "Chinese (Simplified)",
    nativeName: "简体中文",
  },
} as const satisfies Record<Language, LanguageConfig>;
