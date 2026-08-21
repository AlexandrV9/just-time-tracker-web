import { useCallback } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useTranslation } from "~/shared/hooks";
import { Flex, Select, Text } from "~/shared/ui";
import { LangFlag } from "./LangFlag";
import { languageListCollection, type Language } from "./constants";
import { useLanguage } from "./useLanguage";
import { isSupportedLanguage } from "./utils";

export { LANGUAGES } from "./constants";

const formatLangCode = (lng: string) => lng.toUpperCase();

export type LangSwitcherProps = {
  isShort?: boolean;
};

export const LangSwitcher = ({ isShort = true }: LangSwitcherProps) => {
  const { t } = useTranslation();
  const { onChangeLang, lang } = useLanguage();

  const renderLabel = useCallback(
    (lng: Language) => (isShort ? formatLangCode(lng) : t(`languages.${lng}`)),
    [isShort, t],
  );

  return (
    <Select.Root
      value={[lang]}
      collection={languageListCollection}
      onValueChange={(e) => onChangeLang(e.value[0])}
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
            <LangFlag code={lang} size={22} />
            <Select.ValueText color="fg" fontWeight="semibold">
              {renderLabel(lang)}
            </Select.ValueText>
            <LuChevronDown size={14} />
          </Flex>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content minW="100%" w="max-content">
          {languageListCollection.items.map(({ label, value: ln }) => {
            if (!isSupportedLanguage(ln)) return null;

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
