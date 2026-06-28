import i18n from "i18next";
import type { UserLocaleDTO } from "@time-tracker/shared";

export const applyUserLocale = (locale?: UserLocaleDTO | string | null) => {
  if (!locale || locale === i18n.language) {
    return;
  }

  void i18n.changeLanguage(locale);
};
