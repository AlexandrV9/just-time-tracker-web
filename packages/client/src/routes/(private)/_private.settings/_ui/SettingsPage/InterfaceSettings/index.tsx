import { SettingsLink } from "~/shared/components";
import { useTranslation } from "~/shared/hooks";
import { Box, EarthIcon, List, Text } from "~/shared/ui";
import { PaintIcon } from "~/shared/ui/icons/Paint";

export const InterfaceSettings = () => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      gap="0.5rem"
      flexDirection="column"
      border="1px solid"
      borderRadius="xl"
      borderColor="border.emphasized"
      p="1rem"
    >
      <Text textStyle="xl" fontWeight="bold">
        {t("pages.settings.interfaceSettings.title")}
      </Text>
      <List.Root>
        <SettingsLink
          to="/settings/language"
          icon={<EarthIcon />}
          label={t("pages.settings.interfaceSettings.links.language")}
        />
        <SettingsLink
          to="/settings/theme"
          icon={<PaintIcon />}
          label={t("pages.settings.interfaceSettings.links.theme")}
        />
      </List.Root>
    </Box>
  );
};
