import { NavList } from "~/shared/components";
import { useTranslation } from "~/shared/hooks";
import { Box, ChartLineIcon, SettingsIcon } from "~/shared/ui";

export type NavLinksProps = {
  activityId: string;
};

export const NavLinks = ({ activityId }: NavLinksProps) => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="0.5rem"
      border="1px solid"
      borderRadius="xl"
      borderColor="border.emphasized"
      p="1rem"
      mt="auto"
    >
      <NavList>
        <NavList.Item
          to="/activities/$activityId/analytics"
          params={{ activityId }}
          icon={<ChartLineIcon size={20} />}
          label={t("pages.activities.analytics.navLabel")}
        />
        <NavList.Item
          to="/activities/$activityId/settings"
          params={{ activityId }}
          icon={<SettingsIcon size={20} />}
          label={t("pages.activities.settings.navLabel")}
        />
      </NavList>
    </Box>
  );
};
