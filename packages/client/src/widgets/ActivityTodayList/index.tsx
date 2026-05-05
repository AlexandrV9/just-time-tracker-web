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
import { useSelectedActivity } from "~/features";
import type { ActivityDTO } from "@to-do-list/shared";

export const ActivityTodayList = () => {
  const { activity, setActivity } = useSelectedActivity();
  const selectedActivityId = activity?.id;

  const addTodayActivityDialog = useDialog();

  const { planId, activityGroup, isLoading, isError } = useTodayActivities();

  const { mutateAsync: startActivity } = useStartActivity();
  const { mutateAsync: pauseActivity } = usePauseActivity();
  const { mutateAsync: finishActivity } = useFinishActivity();
  const { mutateAsync: addTodayActivities } = useAddTodayActivities({
    planId,
  });

  const runningActivityId = activityGroup?.activities.find(
    (item) => item.status === "active",
  )?.id;

  console.log("runningActivityId", runningActivityId);

  const handleSelectActivity = (activity: ActivityDTO) => {
    if (runningActivityId && activity.id !== runningActivityId) return;
    setActivity(activity);
  };

  const handleStartActivity = async (activity: ActivityDTO) => {
    if (runningActivityId && activity.id !== runningActivityId) return;
    setActivity(activity);
    return startActivity(activity.id);
  };

  const handlePauseActivity = async (activity: ActivityDTO) => {
    if (runningActivityId && activity.id !== runningActivityId) return;
    pauseActivity(activity.id);
    setActivity(activity);
  };

  const handleFinishActivity = (activity: ActivityDTO) => {
    if (runningActivityId && activity.id !== runningActivityId) return;
    finishActivity?.(activity.id);
  };

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
        selectedActivityId={selectedActivityId}
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
