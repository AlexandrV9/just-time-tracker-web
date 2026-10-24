import { type UseDialogReturn } from "@ark-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
} from "react";
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
  Dialog,
  EmptyBox,
  EmptyState,
  Flex,
  Portal,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from "~/shared/ui";

export type AddActivitiesDialogProps = {
  dialog: UseDialogReturn;
  /** Активности, которые нужно скрыть из списка выбора (например, уже добавленные). */
  excludeActivityIds?: string[];
  /** Заголовок диалога. По умолчанию — «Добавить активности». */
  title?: string;
  /** Дополнительное условие блокировки кнопки подтверждения. */
  extraSubmitDisabled?: boolean;
  onSubmit?: (activityIds: string[]) => Promise<unknown>;
};

const SKELETON_COUNT = 8;

export function AddActivitiesDialog({
  dialog,
  excludeActivityIds,
  title,
  extraSubmitDisabled = false,
  onSubmit,
}: AddActivitiesDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userId = useAuthStore((state) => state.user?.id);

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
        (activity) => !excludeActivityIds?.includes(activity.id),
      ),
    [activities, excludeActivityIds],
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

  const handleGoToActivities = useCallback(() => {
    dialog.setOpen(false);
    navigate({ to: "/activities" });
  }, [dialog, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsPending(true);
    onSubmit?.(Array.from(selectedActivityIds)).finally(() => {
      setIsPending(false);
      dialog.setOpen(false);
    });
  };

  const isDisableSubmitButton =
    isPending || extraSubmitDisabled || selectedActivityIds.size === 0;

  const renderActivities = () => {
    if (isLoadingActivities) {
      return (
        <ScrollArea.Root maxH="min(50dvh, 360px)" overflow="hidden">
          <ScrollArea.Viewport>
            <Stack.VStack gap={3} align="stretch" as="ul" pr={2}>
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
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
        <EmptyState.Root p={0}>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <EmptyBox size={60} />
            </EmptyState.Indicator>
            <Stack.VStack textAlign="center">
              <EmptyState.Title>
                {t(
                  "widgets.todayActivityList.addTodayActivitiesDialog.emptyTitle",
                )}
              </EmptyState.Title>
              <EmptyState.Description>
                {t("widgets.todayActivityList.addTodayActivitiesDialog.empty")}
              </EmptyState.Description>
            </Stack.VStack>
          </EmptyState.Content>
        </EmptyState.Root>
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
            {visibleActivities.map((activity) => (
              <Box as="li" key={activity.id}>
                <Checkbox.Root
                  checked={selectedActivityIds.has(activity.id)}
                  onCheckedChange={(details) =>
                    handleChangeSelectActivity(
                      activity.id,
                      Boolean(details.checked),
                    )
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>{activity.title}</Checkbox.Label>
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
            maxH="min(85dvh, 90dvh)"
            overflow="hidden"
          >
            <Dialog.Header>
              <Dialog.Title fontSize="xl">
                {title ??
                  t("widgets.todayActivityList.addTodayActivitiesDialog.title")}
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

              {activities.length === 0 ? (
                <Button onClick={handleGoToActivities}>
                  {t(
                    "widgets.todayActivityList.addTodayActivitiesDialog.goToActivitiesButton",
                  )}
                </Button>
              ) : (
                <Button
                  disabled={isDisableSubmitButton}
                  form={formId}
                  type="submit"
                >
                  {t(
                    "widgets.todayActivityList.addTodayActivitiesDialog.addButton",
                  )}
                </Button>
              )}
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Dialog.CloseButton />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
