import type { ActivityDTO } from "@to-do-list/shared";
import { useTodayActivities } from "~/widgets/ActivityTodayList/useTodayActivities";

type UseRunningActivityResult = {
  runningActivity: ActivityDTO | undefined;
  activities: ActivityDTO[];
};

export function useRunningActivity(): UseRunningActivityResult {
  const { activityGroup } = useTodayActivities();

  /** Совпадает с карточкой с идущим счётом: только `active`, паузы смотреть только по выбору из URL. */
  const runningActivity = activityGroup.activities.find(
    (a) => a.status === "active",
  );

  return { runningActivity, activities: activityGroup.activities };
}
