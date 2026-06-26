import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ACTIVITIES_QUERY_KEY, activityApiService } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { BackButton, Box, Stack, Text } from "~/shared/ui";
import { useHeaderLeftContent } from "~/widgets";
import { MotivationBlock } from "./MotivationBlock";
import { NotificationsBlock } from "./NotificationsBlock";

export const ActivitySettingsPage = () => {
  const { t } = useTranslation();
  const { activityId } = useParams({
    from: "/(private)/_private/activities/$activityId/settings",
  });

  useHeaderLeftContent(
    <BackButton
      to="/activities/$activityId"
      params={{ activityId }}
      aria-label={t("pages.activities.settings.backButton")}
    />,
  );

  const { data: activity, isPending: isActivityPending } = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, activityId],
    queryFn: () => activityApiService.getActivity({ id: activityId }),
    select: (data) => (data.success ? data.data : null),
  });

  if (isActivityPending) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        py={10}
      >
        <Text color="fg.muted">{t("pages.activities.detail.loading")}</Text>
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        py={10}
      >
        <Text color="fg.muted">{t("pages.activities.detail.notFound")}</Text>
      </Box>
    );
  }

  return (
    <Stack.VStack
      alignItems="stretch"
      p={4}
      w="full"
      maxW="520px"
      mx="auto"
      gap="1rem"
    >
      <Stack.VStack gap={1} py={2} alignItems="start">
        <Text textStyle="lg" fontWeight="semibold">
          {activity.title}
        </Text>
        <Text textStyle="sm" color="fg.muted">
          {t("pages.activities.settings.subtitle")}
        </Text>
      </Stack.VStack>
      <MotivationBlock activityId={activityId} />
      <NotificationsBlock activityId={activityId} />
    </Stack.VStack>
  );
};
