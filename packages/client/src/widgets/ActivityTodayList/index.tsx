import { ActivityGroup } from "../ActivityGroup";

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
import { useTodayActivities } from "./useTodayActivities";
import {
  useFinishActivity,
  usePauseActivity,
  useStartActivity,
} from "./mutations";
import type { ActivityDTO } from "@to-do-list/shared";
import { useCurrentActivity } from "~/features";

export const ActivityTodayList = () => {
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
                Не удалось загрузить активности
              </EmptyState.Title>
              <EmptyState.Description>
                Попробуйте перезагрузить страницу
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
              <EmptyState.Title>На сегодня нет активностей</EmptyState.Title>
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
        selectedActivityIds={activityGroup.activities.map((item) => item.id)}
        onSubmit={addTodayActivities}
      />
    </>
  );
};
