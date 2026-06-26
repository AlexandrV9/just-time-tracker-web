import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { BackButton, Box, ChartLineIcon, Flex, Stack, Text } from "~/shared/ui";
import { ActivityAnalytics, useHeaderLeftContent } from "~/widgets";

export const ActivityAnalyticsPage = () => {
  const { t } = useTranslation();
  const { activityId } = useParams({
    from: "/(private)/_private/activities/$activityId/analytics",
  });

  const navigate = useNavigate();

  const { date: dateFromSearch } = useSearch({
    from: "/(private)/_private/activities/$activityId/analytics",
  });

  const { data: activity, isPending } = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, activityId],
    queryFn: () => activityApiService.getActivity({ id: activityId }),
    select: (data) => (data.success ? data.data : null),
  });

  const handleBack = useCallback(() => {
    if (dateFromSearch) {
      navigate({
        to: "/history",
        search: { highlight: activityId, highlightDate: dateFromSearch },
      });
    } else {
      navigate({
        to: "/activities/$activityId",
        params: { activityId },
      });
    }
  }, [dateFromSearch, activityId, navigate]);

  useHeaderLeftContent(
    <BackButton
      to="/activities/$activityId"
      params={{ activityId }}
      onBack={handleBack}
    />,
  );

  if (isPending) {
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
      flexGrow={1}
    >
      <Stack.VStack gap={1} py={2} alignItems="start">
        <Text textStyle="lg" fontWeight="semibold">
          {activity.title}
        </Text>
        <Flex alignItems="center" gap={2}>
          <ChartLineIcon size={20} />
          <Text textStyle="lg">{t("pages.activities.analytics.title")}</Text>
        </Flex>
      </Stack.VStack>
      <ActivityAnalytics activityId={activity.id} />
    </Stack.VStack>
  );
};
