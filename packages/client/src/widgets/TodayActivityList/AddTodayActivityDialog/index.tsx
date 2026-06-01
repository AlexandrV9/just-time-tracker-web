import { type UseDialogReturn } from "@ark-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { useInView } from "react-intersection-observer";
import { useAuthStore } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from "~/shared/ui";

export type AddTodayActivitiesDialogProps = {
  dialog: UseDialogReturn;
  selectedActivityIds?: string[];
  onSubmit?: (activityIds: string[]) => Promise<unknown>;
};

const SKELETOM_COUNT = 8;

export function AddTodayActivitiesDialog({
  dialog,
  selectedActivityIds: initialSelectedActivityIds,
  onSubmit,
}: AddTodayActivitiesDialogProps) {
  const { t } = useTranslation();

  const { user } = useAuthStore();
  const userId = user?.id;

  const formId = useId();

  const [isPending, setIsPending] = useState(false);

  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(
    () => new Set(),
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingActivities,
  } = useInfiniteQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, "add-dialog", userId],
    queryFn: (ctx) =>
      activityApiService.getActivities({
        page: ctx.pageParam,
        limit: 20,
        sortOrder: "desc",
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.success && lastPage.data.pagination.hasNext) {
        return lastPage.data.pagination.page + 1;
      }
    },
    enabled: !!userId,
  });

  const activities = useMemo(
    () => data?.pages.flatMap((p) => (p.success ? p.data.data : [])) ?? [],
    [data],
  );

  const visibleActivities = useMemo(
    () =>
      activities.filter(
        (activity) => !initialSelectedActivityIds?.includes(activity.id),
      ),
    [activities, initialSelectedActivityIds],
  );

  const { ref: fetchRef, inView: isLastInView } = useInView();

  useEffect(() => {
    if (isLastInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isLastInView, hasNextPage, fetchNextPage]);

  const handleChangeSelectActivity = (activityId: string, checked: boolean) => {
    setSelectedActivityIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(activityId);
      } else {
        next.delete(activityId);
      }
      return next;
    });
  };

  const handleCloseDialog = useCallback(() => {
    dialog.setOpen(false);
  }, [dialog]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsPending(true);
    onSubmit?.(Array.from(selectedActivityIds)).finally(() => {
      setIsPending(false);
      dialog.setOpen(false);
    });
  };

  const isDisableSubmitButton = isPending || selectedActivityIds.size === 0;

  const renderActivities = () => {
    if (isLoadingActivities) {
      return (
        <ScrollArea.Root maxH="min(50dvh, 360px)" overflow="hidden">
          <ScrollArea.Viewport>
            <Stack.VStack gap={3} align="stretch" as="ul" pr={2}>
              {Array.from({ length: SKELETOM_COUNT }).map((_, index) => (
                <Flex as="li" gap="0.625rem" key={index}>
                  <Skeleton w={5} h={5} />
                  <Skeleton h={5} flexGrow={1} />
                </Flex>
              ))}
            </Stack.VStack>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      );
    }

    if (activities.length === 0) {
      return (
        <Text color="fg.muted" textAlign="center">
          {t("widgets.todayActivityList.addTodayActivitiesDialog.empty")}
        </Text>
      );
    }

    if (visibleActivities.length === 0) {
      return (
        <Text color="fg.muted" textAlign="center">
          {t("widgets.todayActivityList.addTodayActivitiesDialog.noActivities")}
        </Text>
      );
    }
    return (
      <ScrollArea.Root maxH="min(50dvh, 360px)" overflow="hidden">
        <ScrollArea.Viewport>
          <Stack.VStack gap={3} align="stretch" as="ul" pr={2}>
            {visibleActivities.map((activitiy) => (
              <Box as="li" key={activitiy.id}>
                <Checkbox.Root
                  checked={selectedActivityIds.has(activitiy.id)}
                  onCheckedChange={(details) =>
                    handleChangeSelectActivity(
                      activitiy.id,
                      Boolean(details.checked),
                    )
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>{activitiy.title}</Checkbox.Label>
                </Checkbox.Root>
              </Box>
            ))}
          </Stack.VStack>
          <div ref={fetchRef} style={{ height: 1 }} />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  };

  return (
    <Dialog.RootProvider size="md" placement="center" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW="md"
            w="full"
            mx={4}
            borderRadius="xl"
            display="flex"
            flexDirection="column"
            minH="320px"
            maxH="min(85dvh, 560px)"
            overflow="hidden"
          >
            <Dialog.Header>
              <Dialog.Title fontSize="xl">
                {t("widgets.todayActivityList.addTodayActivitiesDialog.title")}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body
              flex="1"
              minH={0}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <Stack.VStack
                as="form"
                gap={4}
                align="stretch"
                h="full"
                id={formId}
                onSubmit={handleSubmit}
              >
                {renderActivities()}
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
              display="flex"
              gap={3}
              justifyContent="flex-end"
            >
              <Button variant="outline" onClick={handleCloseDialog}>
                {t(
                  "widgets.todayActivityList.addTodayActivitiesDialog.cancelButton",
                )}
              </Button>
              <Button
                disabled={isDisableSubmitButton}
                form={formId}
                type="submit"
              >
                {t(
                  "widgets.todayActivityList.addTodayActivitiesDialog.addButton",
                )}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
