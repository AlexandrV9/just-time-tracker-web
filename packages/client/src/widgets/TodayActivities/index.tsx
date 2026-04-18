import { ActivityGroupListItem } from "../ActivityGroupList/ActivityGroupListItem";
import {
  useFinishActivity,
  usePauseActivity,
  useStartActivity,
} from "../DayPlanList/mutations";
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

export const TodayActivities = () => {
  const addTodayActivityDialog = useDialog();

  const { planId, activityGroup, isLoading, isError } = useTodayActivities();

  const { mutateAsync: startActivity } = useStartActivity();
  const { mutateAsync: pauseActivity } = usePauseActivity();
  const { mutateAsync: finishActivity } = useFinishActivity();
  const { mutateAsync: addTodayActivities } = useAddTodayActivities({
    planId,
  });

  const renderContent = () => {
    if (isLoading) {
      return <ActivityGroupListItem.Skeleton />;
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
      <ActivityGroupListItem
        withControlButtons
        data={activityGroup}
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
        selectedActivityIds={activityGroup.activities.map((item) => item.id)}
        onSubmit={addTodayActivities}
      />
    </>
  );
};
