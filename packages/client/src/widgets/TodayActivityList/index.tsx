import { ActivityGroup } from "../ActivityGroup";

import { useDialog } from "@ark-ui/react";
import {
  Box,
  EmptyState,
  Flex,
  IconButton,
  PlusIcon,
  Stack,
  Text,
  VersionIcon,
} from "~/shared/ui";
import { AddTodayActivitiesDialog } from "./AddTodayActivityDialog";
import { VStack } from "@chakra-ui/react";
import { useAddTodayActivities } from "./useAddTodayActivities";
import { useTodayActivities } from "./useTodayActivities";
import {
  useFinishActivity,
  usePauseActivity,
  useStartActivity,
} from "./mutations";
import type { ActivityDTO } from "@to-do-list/shared";
import { useCurrentActivity } from "~/features";
import { useTranslation } from "~/shared/hooks";

export const TodayActivityList = () => {
  const { t } = useTranslation();
  const addTodayActivityDialog = useDialog();

  const { currentActivity, setCurrentActivity } = useCurrentActivity();
  const { planId, activityGroup, isLoading, isError } = useTodayActivities();

  const currentActivityId = currentActivity?.id;
  const hasRunningActivity = currentActivity?.status === "active";

  const handleSelectActivity = (activity: ActivityDTO) => {
    if (hasRunningActivity) return;
    setCurrentActivity((prevActivity) =>
      prevActivity?.id === activity.id ? null : activity,
    );
  };

  const { mutateAsync: startActivity } = useStartActivity();

  const handleStartActivity = async (activity: ActivityDTO) => {
    if (hasRunningActivity && activity.id !== currentActivityId) return;
    setCurrentActivity(activity);
    return startActivity({
      activityId: activity.id,
      startedAt: new Date().toISOString(),
      activeDurationMs: activity.activeDurationMs,
    });
  };

  const { mutateAsync: pauseActivity } = usePauseActivity();

  const handlePauseActivity = async (activity: ActivityDTO) => {
    if (hasRunningActivity && activity.id !== currentActivityId) return;
    return pauseActivity({
      activityId: activity.id,
      pausedAt: new Date().toISOString(),
    });
  };

  const { mutateAsync: finishActivity } = useFinishActivity();

  const handleFinishActivity = (activity: ActivityDTO) => {
    if (hasRunningActivity && activity.id !== currentActivityId) return;
    return finishActivity?.({
      activityId: activity.id,
      finishedAt: new Date().toISOString(),
    });
  };

  const { mutateAsync: addTodayActivities } = useAddTodayActivities({
    planId,
  });

  const renderContent = () => {
    if (isLoading) {
      return <ActivityGroup.Skeleton />;
    }

    if (isError) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.todayActivityList.error")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.todayActivityList.errorDescription")}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    if (!activityGroup || activityGroup.activities.length === 0) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.todayActivityList.empty")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.todayActivityList.emptyDescription")}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    return (
      <ActivityGroup
        withControlButtons
        data={activityGroup}
        selectedActivityId={currentActivity?.id}
        onSelect={handleSelectActivity}
        onStart={handleStartActivity}
        onPause={handlePauseActivity}
        onFinish={handleFinishActivity}
      />
    );
  };

  const content = renderContent();

  return (
    <>
      <Flex align="center" justify="center" h="30px" position="relative">
        <Box w="full" h="1px" bg="bg.emphasized" />
      </Flex>
      <Stack.VStack w="full" p="0.5rem" alignItems="stretch">
        <Flex gap="1rem" alignItems="center">
          <Text textStyle="2xl" fontWeight="bolder">
            {t("widgets.todayActivityList.title")}
          </Text>
          <IconButton
            aria-label={t("widgets.todayActivityList.newActivityButton")}
            variant="outline"
            size="xs"
            onClick={() => addTodayActivityDialog.setOpen(true)}
          >
            <PlusIcon size={22} />
          </IconButton>
        </Flex>
        <Box w="full">{content}</Box>
      </Stack.VStack>
      <AddTodayActivitiesDialog
        dialog={addTodayActivityDialog}
        selectedActivityIds={activityGroup.activities.map((item) => item.id)}
        onSubmit={addTodayActivities}
      />
    </>
  );
};
