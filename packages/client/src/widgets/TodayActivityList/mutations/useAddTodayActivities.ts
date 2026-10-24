import { useAddDayPlanActivities } from "~/features";

export const useAddTodayActivities = () => {
  return useAddDayPlanActivities(new Date());
};
