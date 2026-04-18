import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import {
  DAY_PLAN_ITEMS_QUERY_KEY,
  dayPlanApiService,
} from "~/shared/api/services";
import { getCalendarDay } from "~/shared/libs";

export type UseAddTodayActivitiesProps = {
  todayPlanId?: string;
};

export const useAddTodayActivities = ({
  todayPlanId,
}: UseAddTodayActivitiesProps) => {
  const queryClient = useQueryClient();

  const { user } = useAuthStore();
  const userId = user?.id;

  const todayCalendarDay = getCalendarDay();

  return useMutation({
    mutationFn: async (activityIds: string[]) => {
      let currentPlanId = todayPlanId;

      console.log("currentPlanId", currentPlanId);

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

      console.log("addDayPlanItems", currentPlanId, activityIds);
      return dayPlanApiService.addDayPlanItems({
        dayPlanId: currentPlanId!,
        activityIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DAY_PLAN_ITEMS_QUERY_KEY] });
    },
    onError: () => {},
  });
};
