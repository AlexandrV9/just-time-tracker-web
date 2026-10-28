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
  ActionButton,
  PanelHeading,
  DesignEmptyState,
  Skeleton,
} from "~/shared/ui";
import { TodayActivityRow } from "./TodayActivityRow";
import { AddActivitiesDialog } from "../AddActivitiesDialog";
import { useTodayActivities } from "./useTodayActivities";
import {
  useFinishActivity,
  usePauseActivity,
  useStartActivity,
  useCurrentActivity,
} from "~/features";
import { useAddTodayActivities } from "./mutations";
import { useTranslation } from "~/shared/hooks";
import { TodayActivityGroup } from "./TodayActivityGroup";
import type { ActivityState } from "~/shared/api/services";

export const TodayActivityList = ({
  variant = "cards",
}: {
  variant?: "cards" | "rows";
}) => {
  const { t } = useTranslation();
  const addTodayActivityDialog = useDialog();

  const { currentActivity, setCurrentActivity, updateData } =
    useCurrentActivity();

  const { activityGroup, isLoading, isError } = useTodayActivities();

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
    return finishActivity?.({
      ...data,
      finishedAt: new Date().toISOString(),
    });
  };

  const { mutateAsync: addTodayActivities } = useAddTodayActivities();

  const renderContent = () => {
    if (isLoading) {
      return variant === "rows" ? (
        <Stack.VStack gap={2}>
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} height="46px" width="full" />
          ))}
        </Stack.VStack>
      ) : (
        <TodayActivityGroup.Skeleton />
      );
    }

    if (isError) {
      if (variant === "rows")
        return (
          <DesignEmptyState>
            {t("widgets.todayActivityList.errorDescription")}
          </DesignEmptyState>
        );
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
      if (variant === "rows")
        return (
          <DesignEmptyState>
            {t("widgets.todayActivityList.emptyDescription")}
          </DesignEmptyState>
        );
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

    if (variant === "rows")
      return (
        <Stack.VStack gap={2} align="stretch">
          {activityGroup.activities.map((row, index) => (
            <TodayActivityRow
              key={row.activity.id}
              row={row}
              index={index}
              selected={row.activity.id === currentActivityId}
              blocked={
                hasRunningActivity && row.activity.id !== currentActivityId
              }
              onSelect={() => handleSelectActivity(row)}
              onStart={() => void handleStartActivity(row)}
              onPause={() => void handlePauseActivity(row)}
              onFinish={() => void handleFinishActivity(row)}
            />
          ))}
        </Stack.VStack>
      );

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
      <Stack.VStack
        w="full"
        p={variant === "rows" ? "0" : "0.5rem"}
        alignItems="stretch"
      >
        {variant === "rows" ? (
          <PanelHeading
            title={t("pages.dashboard.plan")}
            action={
              <ActionButton
                compact
                tone="ghost"
                aria-label={t("widgets.todayActivityList.newActivityButton")}
                onClick={() => addTodayActivityDialog.setOpen(true)}
              >
                <PlusIcon size={17} />
              </ActionButton>
            }
          />
        ) : (
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
        )}
        <Box w="full">{content}</Box>
      </Stack.VStack>
      <AddActivitiesDialog
        dialog={addTodayActivityDialog}
        excludeActivityIds={activityGroup.activities.map(
          (item) => item.activity.id,
        )}
        onSubmit={addTodayActivities}
      />
    </>
  );
};
