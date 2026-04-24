import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import {
  DAY_PLAN_ITEMS_QUERY_KEY,
  DAY_PLANS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { getCalendarDay } from "~/shared/libs";
import { toast } from "~/shared/ui";

export type UseAddTodayActivitiesProps = {
  planId?: string;
};

export const useAddTodayActivities = ({
  planId,
}: UseAddTodayActivitiesProps) => {
  const queryClient = useQueryClient();

  const { user } = useAuthStore();
  const userId = user?.id;

  const todayCalendarDay = getCalendarDay();

  return useMutation({
    mutationFn: async (activityIds: string[]) => {
      let currentPlanId = planId;

      if (!currentPlanId) {
        const todayPlan = await dayPlanApiService.createDayPlan({
          createdById: userId!,
          date: todayCalendarDay,
        });

        if (!todayPlan.success) {
          throw new Error();
        }

        currentPlanId = todayPlan.data.id;
      }

      return dayPlanApiService.addDayPlanItems({
        dayPlanId: currentPlanId!,
        activityIds,
      });
    },
    onSuccess: () => {
      toast.success("Активности добавлены");

      queryClient.invalidateQueries({
        queryKey: [DAY_PLANS_QUERY_KEY, userId, todayCalendarDay],
      });
      queryClient.invalidateQueries({
        queryKey: [DAY_PLAN_ITEMS_QUERY_KEY, planId],
      });
    },
    onError: () => {
      toast.error("Не удалось добавить активности");
    },
  });
};
