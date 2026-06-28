import { useCallback } from "react";
import type { UserLocaleDTO } from "@time-tracker/shared";
import { useAuthStore } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { userApiService } from "~/shared/api/services";

import { Select, Text } from "~/shared/ui";
import { createListCollection } from "~/shared/utils";

export const LANGUAGES = {
  en: "en",
  ru: "ru",
  zh: "zh",
} as const;

const languageListCollection = createListCollection({
  items: Object.keys(LANGUAGES).map((item) => ({ label: item, value: item })),
});

export type LangSwitcherProps = {
  isShort?: boolean;
};

function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const LangSwitcher = ({ isShort = true }: LangSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const authStatus = useAuthStore((state) => state.status);

  const currentLn = i18n.language;

  const handleChangeLanguage = useCallback(
    (lng: string) => {
      void i18n.changeLanguage(lng);

      if (authStatus === "AUTHENTICATED") {
        void userApiService.updateLocale({ locale: lng as UserLocaleDTO });
      }
    },
    [authStatus, i18n],
  );

  return (
    <Select.Root
      value={[currentLn]}
      collection={languageListCollection}
      onValueChange={(e) => handleChangeLanguage(e.value[0])}
      width={isShort ? "40px" : "fit-content"}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger
          p={0}
          cursor="pointer"
          justifyContent="center"
          borderRadius={12}
          shadow="0 2px 8px rgba(0, 0, 0, 0.25)"
          _hover={{ cursor: "pointer", bg: "bg.muted" }}
        >
          <Select.ValueText color="fg" fontWeight="semibold">
            {isShort
              ? capitalizeFirstLetter(currentLn)
              : t(`languages.${currentLn}`)}
          </Select.ValueText>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {languageListCollection.items.map(({ label, value: ln }) => (
            <Select.Item
              item={label}
              key={ln}
              color="fg"
              _hover={{ cursor: "pointer" }}
            >
              <Text fontWeight="medium">
                {isShort ? capitalizeFirstLetter(ln) : t(`languages.${ln}`)}
              </Text>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
};
