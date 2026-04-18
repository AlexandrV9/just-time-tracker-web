import { useQuery } from "@tanstack/react-query";
import { ActivityGroupListItem } from "../ActivityGroupList/ActivityGroupListItem";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { useAuthStore } from "~/features/auth";
import {
  useFinishActivity,
  usePauseActivity,
  useStartActivity,
} from "../DayPlanList/mutations";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";
import { useDialog } from "@ark-ui/react";
import {
  Box,
  EmptyState,
  Flex,
  IconButton,
  PlusIcon,
  VersionIcon,
} from "~/shared/ui";
import { AddTodayActivitiesDialog } from "./AddTodayActivityDialog";
import { VStack } from "@chakra-ui/react";
import { useAddTodayActivities } from "./useAddTodayActivities";

export const TodayActivities = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  const addTodayActivityDialog = useDialog();

  const todayCalendarDay = getCalendarDay();

  const { fromDate, toDate } = getDateIntervalByCalendarDay(todayCalendarDay);

  const { data: todayPlanActivitiesResponse } = useQuery({
    queryKey: [DAY_PLANS_QUERY_KEY, userId, todayCalendarDay],
    queryFn: () =>
      dayPlanApiService.getDayPlans({
        createdById: userId!,
        date: todayCalendarDay,
        page: 0,
        limit: 1,
      }),
    enabled: !!userId,
    select: (response) => (response.success ? response.data : undefined),
  });
  const todayPlan = todayPlanActivitiesResponse?.data?.[0];
  const todayPlanId = todayPlan?.id;

  const { data: todayPlanItemsResponse } = useQuery({
    queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, todayPlanId],
    queryFn: () =>
      dayPlanApiService.getDayPlanItems({
        dayPlanId: todayPlanId!,
        page: 0,
        limit: 100,
      }),
    enabled: !!todayPlanId,
    select: (response) => (response.success ? response.data : undefined),
  });
  const todayPlanItems = todayPlanItemsResponse?.data;
  const todayActivityIds =
    todayPlanItems?.map((planItem) => planItem.activityId) ?? [];

  const { data: activities = [] } = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, userId, fromDate, toDate],
    queryFn: () =>
      activityApiService.getActivitiesByIds({ activityIds: todayActivityIds }),
    enabled: todayActivityIds?.length !== 0,
    select: (response) => (response.success ? response.data : []),
  });

  const { mutateAsync: startActivity } = useStartActivity();
  const { mutateAsync: pauseActivity } = usePauseActivity();
  const { mutateAsync: finishActivity } = useFinishActivity();
  const { mutateAsync: addTodayActivities } = useAddTodayActivities({
    todayPlanId,
  });

  const renderContent = () => {
    if (activities.length === 0) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>На сегодня нет активностей</EmptyState.Title>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    console.log("activities", activities);

    return (
      <ActivityGroupListItem
        withControlButtons
        calendarDay={todayCalendarDay}
        activities={activities}
        onStart={startActivity}
        onPause={pauseActivity}
        onFinish={finishActivity}
      />
    );
  };

  const content = renderContent();

  return (
    <>
      <Flex align="center" justify="center" h="30px">
        <Box w="full" h="1px" bg="bg.emphasized" />
        <IconButton
          size="2xs"
          bg="bg.emphasized"
          position="absolute"
          h="30px"
          w="60px"
          rounded="2xl"
          color="fg"
          onClick={() => addTodayActivityDialog.setOpen(true)}
        >
          <PlusIcon />
        </IconButton>
      </Flex>
      <Box w="full" p="0.5rem">
        {content}
      </Box>
      <AddTodayActivitiesDialog
        dialog={addTodayActivityDialog}
        selectedActivityIds={todayActivityIds}
        onSubmit={addTodayActivities}
      />
    </>
  );
};
