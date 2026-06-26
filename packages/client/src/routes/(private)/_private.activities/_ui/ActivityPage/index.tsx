import {
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { BackButton, Box, Stack, Text } from "~/shared/ui";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { NavLinks } from "./NavLinks";

import { useHeaderLeftContent } from "~/widgets";
import { MainInfo } from "./MainInfo";

export const ActivityPage = () => {
  const { t } = useTranslation();
  const { activityId } = useParams({
    from: "/(private)/_private/activities/$activityId/",
  });

  const navigate = useNavigate();

  const { date: dateFromSearch } = useSearch({
    from: "/(private)/_private/activities/$activityId/",
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
      return;
    }

    navigate({ to: "/activities" });
  }, [dateFromSearch, activityId, navigate]);

  useHeaderLeftContent(<BackButton onBack={handleBack} />);

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
      <Text fontWeight="semibold" textStyle="lg">
        {activity.title}
      </Text>
      <MainInfo activityId={activity.id} />
      <NavLinks activityId={activity.id} />
    </Stack.VStack>
  );
};
