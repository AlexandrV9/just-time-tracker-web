import { type UseDialogReturn } from "@ark-ui/react";
import { useCallback, useId, useState, type FormEvent } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Skeleton,
  Stack,
  Text,
} from "~/shared/ui";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import { VStack } from "@chakra-ui/react";

export type AddTodayActivitiesDialogProps = {
  dialog: UseDialogReturn;
  selectedActivityIds?: string[];
  onSubmit?: (activityIds: string[]) => Promise<any>;
};

const SKELETOM_COUNT = 5;

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

  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, userId],
    queryFn: () =>
      activityApiService.getActivities({
        page: 0,
        limit: 100,
        createdById: userId!,
        sortOrder: "desc",
      }),
    enabled: !!userId,
    select: (response) => (response.success ? response.data.data : []),
  });

  const visibleActivities = activities.filter(
    (activity) => !initialSelectedActivityIds?.includes(activity.id),
  );

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
    });
  };

  const isDisableSubmitButton = isPending || selectedActivityIds.size === 0;

  const renderActivities = () => {
    if (isLoadingActivities) {
      return (
        <Stack.VStack
          gap={3}
          align="stretch"
          as="ul"
          maxH="min(50dvh, 360px)"
          overflowY="auto"
          pr={1}
        >
          {Array.from({ length: SKELETOM_COUNT }).map((_, index) => (
            <Flex as="li" gap="0.625rem" key={index}>
              <Skeleton w={5} h={5} />
              <Skeleton h={5} flexGrow={1} />
            </Flex>
          ))}
        </Stack.VStack>
      );
    }

    if (activities.length === 0) {
      return (
        <Text color="fg.muted" textAlign="center">
          У вас еще нету активностей. Перейдите в раздел активности и создайте
          новую
        </Text>
      );
    }

    if (visibleActivities.length === 0) {
      return (
        <Text color="fg.muted" textAlign="center">
          Нет активностей для выбора
        </Text>
      );
    }
    return (
      <Stack.VStack
        gap={3}
        align="stretch"
        as="ul"
        maxH="min(50dvh, 360px)"
        overflowY="auto"
        pr={1}
      >
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
    );
  };

  return (
    <Dialog.RootProvider size="md" placement="center" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner zIndex={3}>
          <Dialog.Content
            maxW="md"
            w="full"
            mx={4}
            borderRadius="xl"
            display="flex"
            flexDirection="column"
            maxH="min(85dvh, 560px)"
            overflow="hidden"
          >
            <Dialog.Header>
              <Dialog.Title fontSize="xl">Добавить активности</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body
              flex="1"
              minH={0}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <VStack
                as="form"
                gap={4}
                align="stretch"
                h="full"
                id={formId}
                onSubmit={handleSubmit}
              >
                {renderActivities()}
              </VStack>
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
                {t("pages.home.dayPlanDialogCancel")}
              </Button>
              <Button
                disabled={isDisableSubmitButton}
                form={formId}
                type="submit"
              >
                {t("pages.home.dayPlanDialogAdd")}
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
