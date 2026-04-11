import { useDialog } from "@ark-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { ActivityDTO } from "@to-do-list/shared";
import { useTranslation } from "~/shared/hooks";
import {
  ACTIVITIES_QUERY_KEY,
  activityApiService,
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { getLocalCalendarDayKey } from "~/shared/libs";
import { useAuthStore } from "~/features/auth";
import { Button, Card, Flex, Stack, Text, toast } from "~/shared/ui";

import { SelectDayActivitiesDialog } from "./SelectDayActivitiesDialog";

export const DayPlanList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id;
  const todayKey = useMemo(() => getLocalCalendarDayKey(new Date()), []);

  const dialog = useDialog();

  const dayPlanQuery = useQuery({
    queryKey: [DAY_PLANS_QUERY_KEY, userId, todayKey],
    queryFn: () =>
      dayPlanApiService.getDayPlans({
        createdById: userId!,
        date: todayKey,
        page: 0,
        limit: 1,
      }),
    enabled: !!userId,
  });

  const planId = useMemo(() => {
    const res = dayPlanQuery.data;
    if (!res?.success || !res.data.data.length) return undefined;
    return res.data.data[0].id;
  }, [dayPlanQuery.data]);

  const itemsQuery = useQuery({
    queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, planId],
    queryFn: () =>
      dayPlanApiService.getDayPlanItems({
        dayPlanId: planId!,
        page: 0,
        limit: 100,
      }),
    enabled: !!planId,
  });

  const activitiesQuery = useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, userId, "dayPlanPicker"],
    queryFn: () =>
      activityApiService.getActivities({
        createdById: userId!,
        page: 0,
        limit: 100,
      }),
    enabled: !!userId,
  });

  const activities = useMemo(
    () => (activitiesQuery.data?.success ? activitiesQuery.data.data.data : []),
    [activitiesQuery.data],
  );

  const activityById = useMemo(() => {
    const m = new Map<string, ActivityDTO>();
    for (const a of activities) {
      m.set(a.id, a);
    }
    return m;
  }, [activities]);

  const items = useMemo(
    () => (itemsQuery.data?.success ? itemsQuery.data.data.data : []),
    [itemsQuery.data],
  );

  const initialActivityIds = useMemo(
    () => items.map((i) => i.activityId),
    [items],
  );

  const isEmpty = items.length === 0;

  const invalidateDayPlan = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [DAY_PLANS_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [DAY_PLAN_ITEMS_QUERY_KEY] });
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: async (desiredIds: string[]) => {
      if (!userId) throw new Error("No user");

      const desired = new Set(desiredIds);
      let currentPlanId = planId;

      if (!currentPlanId) {
        const created = await dayPlanApiService.createDayPlan({
          createdById: userId,
          date: todayKey,
        });
        if (!created.success) {
          throw new Error(created.message ?? "create day plan");
        }
        currentPlanId = created.data.id;
      }

      const itemsRes = await dayPlanApiService.getDayPlanItems({
        dayPlanId: currentPlanId,
        page: 0,
        limit: 100,
      });
      if (!itemsRes.success) {
        throw new Error(itemsRes.message ?? "load items");
      }

      const currentItems = itemsRes.data.data;
      const currentIds = new Set(currentItems.map((i) => i.activityId));

      const toAdd = [...desired].filter((id) => !currentIds.has(id));
      const toRemove = currentItems.filter((i) => !desired.has(i.activityId));

      for (const item of toRemove) {
        const del = await dayPlanApiService.deleteDayPlanItem(item.id);
        if (!del.success) {
          throw new Error(del.message ?? "delete item");
        }
      }

      for (const activityId of toAdd) {
        const add = await dayPlanApiService.createDayPlanItem({
          dayPlanId: currentPlanId!,
          activityId,
        });
        if (!add.success) {
          throw new Error(add.message ?? "add item");
        }
      }
    },
    onSuccess: () => {
      invalidateDayPlan();
      dialog.setOpen(false);
      toast.success(t("pages.home.dayPlanSaveSuccess"), {
        toastId: "day_plan_saved",
      });
    },
    onError: () => {
      toast.error(t("pages.home.dayPlanSaveError"), {
        toastId: "day_plan_error",
      });
    },
  });

  const handleSave = useCallback(
    async (ids: string[]) => {
      await saveMutation.mutateAsync(ids);
    },
    [saveMutation],
  );

  if (!userId) {
    return null;
  }

  return (
    <Stack.VStack gap={4} align="stretch" w="full">
      {isEmpty ? (
        <Flex justifyContent="center" py={6}>
          <Button
            size="lg"
            variant="outline"
            borderRadius="2xl"
            onClick={() => dialog.setOpen(true)}
          >
            {t("pages.home.dayPlanChooseActivities")}
          </Button>
        </Flex>
      ) : (
        <Stack.VStack gap={2} align="stretch">
          {items.map((item) => {
            const activity = activityById.get(item.activityId);
            return (
              <Card.Root
                key={item.id}
                size="sm"
                borderRadius="xl"
                variant="subtle"
              >
                <Card.Body py={3} px={4}>
                  <Text fontWeight="medium">
                    {activity?.title ?? item.activityId}
                  </Text>
                </Card.Body>
              </Card.Root>
            );
          })}
          <Button
            alignSelf="center"
            size="sm"
            variant="ghost"
            onClick={() => dialog.setOpen(true)}
          >
            {t("pages.home.dayPlanEditSelection")}
          </Button>
        </Stack.VStack>
      )}

      <SelectDayActivitiesDialog
        dialog={dialog}
        activities={activities}
        isActivitiesLoading={activitiesQuery.isLoading}
        initialActivityIds={initialActivityIds}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </Stack.VStack>
  );
};
