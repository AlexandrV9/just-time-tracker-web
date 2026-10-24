import { useAuthStore } from "~/features/auth";
import { isSupportedLanguage } from "./utils";
import { useTranslation } from "~/shared/hooks";
import { useCallback } from "react";
import { userApiService } from "~/shared/api";
import type { UserLocaleDTO } from "@time-tracker/shared";
import { useMutation } from "@tanstack/react-query";

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const { mutate: updateLang, isPending } = useMutation({
    mutationFn: userApiService.updateLocale,
  });

  const authStatus = useAuthStore((state) => state.status);

  const currentLanguage = isSupportedLanguage(i18n.language)
    ? i18n.language
    : "en";

  const handleChangeLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);

      if (authStatus === "AUTHENTICATED") {
        updateLang({ locale: lang as UserLocaleDTO });
      }
    },
    [authStatus, i18n, updateLang],
  );

  return {
    lang: currentLanguage,
    isPending,
    onChangeLang: handleChangeLanguage,
  };
};
