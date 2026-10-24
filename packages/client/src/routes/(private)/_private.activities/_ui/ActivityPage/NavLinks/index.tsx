import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { NavList } from "~/shared/components";
import {
  ACTIVITY_SETTINGS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { queryClient } from "~/shared/config";
import { Box, ChartLineIcon, SettingsIcon } from "~/shared/ui";

export type NavLinksProps = {
  activityId: string;
};

export const NavLinks = ({ activityId }: NavLinksProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    void router.preloadRoute({
      to: "/activities/$activityId/settings",
      params: { activityId },
    });

    void queryClient.prefetchQuery({
      queryKey: [ACTIVITY_SETTINGS_QUERY_KEY, activityId],
      queryFn: () =>
        activityApiService.getActivitySettings({ activityId }),
    });
  }, [activityId, router]);

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
