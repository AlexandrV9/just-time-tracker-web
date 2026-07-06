import { useCallback } from "react";
import { LuChevronDown } from "react-icons/lu";
import type { UserLocaleDTO } from "@time-tracker/shared";
import { useAuthStore } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { userApiService } from "~/shared/api/services";
import { Flex, Select, Text } from "~/shared/ui";
import { createListCollection } from "~/shared/utils";
import { LangFlag } from "./LangFlag";
import { LANGUAGES, type Language } from "./constants";

export { LANGUAGES } from "./constants";

const languageListCollection = createListCollection({
  items: Object.keys(LANGUAGES).map((item) => ({ label: item, value: item })),
});

export type LangSwitcherProps = {
  isShort?: boolean;
};

const formatLangCode = (lng: string) => lng.toUpperCase();

const isLanguage = (lng: string): lng is Language => lng in LANGUAGES;

export const LangSwitcher = ({ isShort = true }: LangSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const authStatus = useAuthStore((state) => state.status);

  const currentLanguage = isLanguage(i18n.language) ? i18n.language : "en";

  const handleChangeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);

      if (authStatus === "AUTHENTICATED") {
        userApiService.updateLocale({ locale: lng as UserLocaleDTO });
      }
    },
    [authStatus, i18n],
  );

  const renderLabel = (lng: Language) =>
    isShort ? formatLangCode(lng) : t(`languages.${lng}`);

  return (
    <Select.Root
      value={[currentLanguage]}
      collection={languageListCollection}
      onValueChange={(e) => handleChangeLanguage(e.value[0])}
      width="fit-content"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger
          px="0.5rem"
          py="0.35rem"
          gap="0.35rem"
          cursor="pointer"
          borderRadius="xl"
          _hover={{ cursor: "pointer", bg: "bg.muted" }}
        >
          <Flex alignItems="center" gap="0.35rem">
            <LangFlag code={currentLanguage} size={22} />
            <Select.ValueText color="fg" fontWeight="semibold">
              {renderLabel(currentLanguage)}
            </Select.ValueText>
            <LuChevronDown size={14} />
          </Flex>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content minW="100%" w="max-content">
          {languageListCollection.items.map(({ label, value: ln }) => {
            if (!isLanguage(ln)) return null;

            return (
              <Select.Item
                item={label}
                key={ln}
                color="fg"
                _hover={{ cursor: "pointer" }}
              >
                <Flex alignItems="center" gap="0.5rem">
                  <LangFlag code={ln} size={22} />
                  <Text fontWeight="medium" textWrap="nowrap">
                    {renderLabel(ln)}
                  </Text>
                </Flex>
              </Select.Item>
            );
          })}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
};
