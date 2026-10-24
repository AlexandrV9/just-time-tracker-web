import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import {
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import { getCalendarDay } from "~/shared/libs";
import { toast } from "~/shared/ui";
import { useDayPlan } from "./useDayPlan";

/**
 * Добавляет выбранные активности в план указанного дня.
 * Если плана на эту дату ещё нет — создаёт его.
 */
export const useAddDayPlanActivities = (selectedDate: Date) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  const calendarDay = getCalendarDay(selectedDate);
  const { data } = useDayPlan(selectedDate);
  const dayPlanId = data?.id;

  return useMutation({
    mutationFn: async (activityIds: string[]) => {
      let currentPlanId = dayPlanId;

      if (!currentPlanId) {
        const createdPlan = await dayPlanApiService.createDayPlan({
          date: calendarDay,
        });

        if (!createdPlan.success) {
          throw new Error(createdPlan.message ?? "Failed to create day plan");
        }

        currentPlanId = createdPlan.data.id;
      }

      return dayPlanApiService.addDayPlanItems({
        dayPlanId: currentPlanId,
        activityIds,
      });
    },
    onSuccess: () => {
      toast.success(
        t("widgets.todayActivityList.addTodayActivitiesDialog.success"),
      );

      queryClient.invalidateQueries({
        queryKey: [DAY_PLANS_QUERY_KEY, userId],
      });
      // Инвалидируем по префиксу: при первом добавлении план создаётся внутри
      // mutationFn, поэтому переданный planId ещё пустой (undefined).
      queryClient.invalidateQueries({
        queryKey: [DAY_PLAN_ITEMS_QUERY_KEY],
      });
    },
    onError: () => {
      toast.error(
        t("widgets.todayActivityList.addTodayActivitiesDialog.error"),
      );
    },
  });
};
