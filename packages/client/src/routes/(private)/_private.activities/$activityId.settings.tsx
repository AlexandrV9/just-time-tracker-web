import { createFileRoute } from "@tanstack/react-router";
import {
  ACTIVITIES_QUERY_KEY,
  ACTIVITY_SETTINGS_QUERY_KEY,
  activityApiService,
} from "~/shared/api/services";
import { ActivitySettingsPage } from "./_ui/ActivitySettingsPage";

export const Route = createFileRoute(
  "/(private)/_private/activities/$activityId/settings",
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: [ACTIVITIES_QUERY_KEY, params.activityId],
        queryFn: () => activityApiService.getActivity({ id: params.activityId }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: [ACTIVITY_SETTINGS_QUERY_KEY, params.activityId],
        queryFn: () =>
          activityApiService.getActivitySettings({ activityId: params.activityId }),
      }),
    ]),
  component: ActivitySettingsPage,
});
