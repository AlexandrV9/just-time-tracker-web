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
import { useTodayActivities } from "./useTodayActivities";
import {
  useFinishActivity,
  usePauseActivity,
  useStartActivity,
  useAddTodayActivities,
} from "./mutations";
import { useTranslation } from "~/shared/hooks";
import { TodayActivityGroup } from "./TodayActivityGroup";
import type { ActivityState } from "~/shared/api/services";
import { useCurrentActivity } from "~/features";

export const TodayActivityList = () => {
  const { t } = useTranslation();
  const addTodayActivityDialog = useDialog();

  const { currentActivity, setCurrentActivity, updateData } =
    useCurrentActivity();

  const { planId, activityGroup, isLoading, isError } = useTodayActivities();

  const currentActivityId = currentActivity?.id;
  const hasRunningActivity = currentActivity?.status === "active";

  const handleSelectActivity = (data: ActivityState) => {
    if (hasRunningActivity) return;

    updateData((prev) => {
      const isSomeActivity = prev.currentActivity?.id === data.activity.id;
      if (isSomeActivity) {
        return {
          currentActivity: null,
          currentSession: null,
          currentSegment: null,
        };
      }

      return {
        currentActivity: data.activity,
        currentSession: data.session,
        currentSegment: data.segment,
      };
    });
  };

  const { mutateAsync: startActivity } = useStartActivity();

  const handleStartActivity = async (data: ActivityState) => {
    if (hasRunningActivity && data.activity.id !== currentActivityId) return;
    setCurrentActivity(data.activity);
    return startActivity({
      activityId: data.activity.id,
      startedAt: new Date().toISOString(),
      activeDurationMs: data.activity.activeDurationMs,
    });
  };

  const { mutateAsync: pauseActivity } = usePauseActivity();

  const handlePauseActivity = async (data: ActivityState) => {
    if (hasRunningActivity && data.activity.id !== currentActivityId) return;
    return pauseActivity({
      ...data,
      pausedAt: new Date().toISOString(),
    });
  };

  const { mutateAsync: finishActivity } = useFinishActivity();

  const handleFinishActivity = (data: ActivityState) => {
    if (hasRunningActivity && data.activity.id !== currentActivityId) return;
    return finishActivity?.({
      ...data,
      finishedAt: new Date().toISOString(),
    });
  };

  const { mutateAsync: addTodayActivities } = useAddTodayActivities({
    planId,
  });

  const renderContent = () => {
    if (isLoading) {
      return <TodayActivityGroup.Skeleton />;
    }

    if (isError) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <Stack.VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.todayActivityList.error")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.todayActivityList.errorDescription")}
              </EmptyState.Description>
            </Stack.VStack>
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
            <Stack.VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.todayActivityList.empty")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.todayActivityList.emptyDescription")}
              </EmptyState.Description>
            </Stack.VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    return (
      <TodayActivityGroup
        data={activityGroup}
        currentActivityId={currentActivity?.id}
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
        selectedActivityIds={activityGroup.activities.map(
          (item) => item.activity.id,
        )}
        onSubmit={addTodayActivities}
      />
    </>
  );
};
