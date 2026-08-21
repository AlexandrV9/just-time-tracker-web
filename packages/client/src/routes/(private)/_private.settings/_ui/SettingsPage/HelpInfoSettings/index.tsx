import { SettingsLink } from "~/shared/components";
import { useTranslation } from "~/shared/hooks";
import { Box, DownloadIcon, List, Text } from "~/shared/ui";

export const HelpInfoSettings = () => {
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
        {t("widgets.helpInfoSettings.title")}
      </Text>
      <List.Root>
        <SettingsLink
          to="/settings/pwa-install"
          icon={<DownloadIcon />}
          label={t("widgets.helpInfoSettings.options.desktopInstall")}
        />
      </List.Root>
    </Box>
  );
};
