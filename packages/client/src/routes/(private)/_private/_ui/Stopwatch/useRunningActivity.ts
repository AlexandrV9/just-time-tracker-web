import type { ActivityDTO } from "@to-do-list/shared";
import { useTodayActivities } from "~/widgets/ActivityTodayList/useTodayActivities";

type UseRunningActivityResult = {
  runningActivity: ActivityDTO | undefined;
};

export function useRunningActivity(): UseRunningActivityResult {
  const { activityGroup } = useTodayActivities();

  const runningActivity = activityGroup.activities.find(
    (activity) => activity.status === "active" || activity.status === "paused",
  );

  return { runningActivity };
}
