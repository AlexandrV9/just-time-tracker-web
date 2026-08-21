import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/features/auth";
import { DAY_PLANS_QUERY_KEY, dayPlanApiService } from "~/shared/api/services";
import { getCalendarDay } from "~/shared/libs";

/**
 * Возвращает id плана дня для указанной даты (или undefined, если плана ещё нет).
 */
export const useDayPlan = (date: Date) => {
  const calendarDay = getCalendarDay(date);
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: [DAY_PLANS_QUERY_KEY, userId, calendarDay],
    queryFn: () =>
      dayPlanApiService.getDayPlans({ date: calendarDay, page: 0, limit: 1 }),
    enabled: Boolean(userId),
    select: (response) => (response.success ? response.data.data[0] : null),
  });
};
