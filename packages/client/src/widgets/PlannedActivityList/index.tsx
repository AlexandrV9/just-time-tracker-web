import { useDialog } from "@ark-ui/react";
import { VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { ActivityCardView, ActivityListView } from "~/entities";
import { useAddDayPlanActivities, useDayPlanActivities } from "~/features";
import { useTranslation } from "~/shared/hooks";
import { getIds } from "~/shared/libs";
import {
  EmptyState,
  Flex,
  IconButton,
  PlusIcon,
  Stack,
  Text,
  VersionIcon,
} from "~/shared/ui";
import { AddActivitiesDialog } from "~/widgets";
import { ActivityCard } from "../ActivityList/ActivityCard";
import { useActivitySkeletonCount } from "./useActivitySkeletonCount";

export type PlannedActivitiesListProps = {
  selectedDate: Date;
};

export function PlannedActivitiesList({
  selectedDate: _selectedDate,
}: PlannedActivitiesListProps) {
  const { t } = useTranslation();

  const addActivitiesDialog = useDialog();
  const skeletonContainerRef = useRef<HTMLDivElement>(null);
  const skeletonCount = useActivitySkeletonCount(skeletonContainerRef);

  const [selectedDate, setSelectedDate] = useState<Date>(_selectedDate);

  useEffect(() => {
    if (!addActivitiesDialog.open) {
      setSelectedDate(_selectedDate);
    }
  }, [_selectedDate, addActivitiesDialog.open]);

  const isPastDate = dayjs(selectedDate).isBefore(dayjs(), "day");

  const { plannedActivities, isError, isLoading, isEmpty } =
    useDayPlanActivities(selectedDate);
  const { mutateAsync: addActivities } = useAddDayPlanActivities(selectedDate);

  const renderContent = () => {
    if (isError) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.activityList.error")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.activityList.errorDescription")}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    if (isLoading) {
      return (
        <ActivityListView>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ActivityListView.Item key={index}>
              <ActivityCardView.Skeleton />
            </ActivityListView.Item>
          ))}
        </ActivityListView>
      );
    }

    if (isEmpty) {
      return (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <VersionIcon size={60} />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>
                {t("widgets.activityList.emptyTitle")}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.activityList.emptyDescription")}
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    }

    return (
      <ActivityListView>
        {plannedActivities.map((activity) => (
          <ActivityListView.Item key={activity.id}>
            <ActivityCard activity={activity} interactive={false} />
          </ActivityListView.Item>
        ))}
      </ActivityListView>
    );
  };

  return (
    <>
      <Stack.VStack w="full" alignItems="stretch">
        <Flex alignItems="center" gap="1rem" my="0.5rem">
          <Text textStyle="2xl" fontWeight="bolder">
            {t("widgets.activityList.title")}
          </Text>
          <IconButton
            aria-label={t("widgets.activityList.newActivityButton")}
            variant="outline"
            size="xs"
            disabled={isPastDate}
            onClick={() => addActivitiesDialog.setOpen(true)}
          >
            <PlusIcon size={22} />
          </IconButton>
        </Flex>
        <div ref={skeletonContainerRef}>{renderContent()}</div>
      </Stack.VStack>
      <AddActivitiesDialog
        dialog={addActivitiesDialog}
        excludeActivityIds={getIds(plannedActivities)}
        title={t("pages.calendar.addActivitiesTitle")}
        onSubmit={addActivities}
      />
    </>
  );
}
