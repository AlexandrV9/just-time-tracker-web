import type {
  CreateActivityDataDTO,
  DeleteActivityDataDTO,
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
  UpdateActivityDataDTO,
  GetActivitySessionDTO,
  StartActivityDTO,
  GetActivityDTO,
  GetActivitiesDTO,
  GetActivitiesByIdsDTO,
  GetActivitiesResponseDTO,
  PauseActivityDTO,
  FinishActivityDTO,
  GetActivitySessionsDTO,
  GetActivitySessionsResponseDTO,
  GetActivitySessionSegmentDTO,
  GetActivityAnalyticsDTO,
  GetActivityAnalyticsResponseDTO,
  GetBatchActivityAnalyticsDTO,
  GetBatchActivityAnalyticsResponseDTO,
  CreateActivityFromQuickTimerDataDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";
import type { RequestResponse } from "../types";

export class ActivityService {
  createActivity(data: CreateActivityDataDTO) {
    return baseApi.post<ActivityDTO>(`/api/activities`, { data });
  }

  createActivityFromQuickTimer(data: CreateActivityFromQuickTimerDataDTO) {
    return baseApi.post<ActivityDTO>(`/api/activities/quick-timer`, { data });
  }

  getActivity({
    id,
  }: GetActivityDTO): Promise<RequestResponse<ActivityDTO, unknown>> {
    return baseApi.get<ActivityDTO>(`/api/activities/${id}`);
  }

  getActivities(data?: GetActivitiesDTO) {
    return baseApi.get<GetActivitiesResponseDTO>(`/api/activities`, {
      params: data,
    });
  }

  getActivitiesByIds(
    data: GetActivitiesByIdsDTO,
  ): Promise<RequestResponse<ActivityDTO[], unknown>> {
    return baseApi.post<ActivityDTO[]>(`/api/activities/by-ids`, { data });
  }

  updateActivity(data: UpdateActivityDataDTO) {
    return baseApi.patch<ActivityDTO>(`/api/activities/${data.id}`, { data });
  }

  deleteActivity(data: DeleteActivityDataDTO) {
    return baseApi.delete<boolean>(`/api/activities/${data.id}`);
  }

  startActivity(data: StartActivityDTO) {
    return baseApi.post<{
      activity: ActivityDTO;
      session: ActivitySessionDTO;
      segment: ActivitySessionSegmentDTO;
    }>(`/api/activities/${data.activityId}/start`);
  }

  pauseActivity(data: PauseActivityDTO) {
    return baseApi.post<{
      activity: ActivityDTO;
      session: ActivitySessionDTO;
      segment: ActivitySessionSegmentDTO;
    }>(`/api/activities/${data.activityId}/pause`);
  }

  finishActivity(data: FinishActivityDTO) {
    return baseApi.post<{
      activity: ActivityDTO;
      session: ActivitySessionDTO;
    }>(`/api/activities/${data.activityId}/finish`);
  }

  getActivitySession(data: GetActivitySessionDTO) {
    return baseApi.get<ActivitySessionDTO>(`/api/activity-sessions/${data.id}`);
  }

  getActivitySessions(
    data: GetActivitySessionsDTO,
  ): Promise<RequestResponse<GetActivitySessionsResponseDTO, unknown>> {
    const { activityId, fromDate, toDate } = data;
    return baseApi.get<GetActivitySessionsResponseDTO>(
      `/api/activities/${activityId}/sessions`,
      {
        params: { fromDate, toDate },
      },
    );
  }

  getActivityAnalytics(
    data: GetActivityAnalyticsDTO,
  ): Promise<RequestResponse<GetActivityAnalyticsResponseDTO, unknown>> {
    const { activityId, fromDate, toDate } = data;
    return baseApi.get<GetActivityAnalyticsResponseDTO>(
      `/api/activities/${activityId}/analytics`,
      {
        params: { fromDate, toDate },
      },
    );
  }

  getBatchActivityAnalytics(
    data: GetBatchActivityAnalyticsDTO,
  ): Promise<RequestResponse<GetBatchActivityAnalyticsResponseDTO, unknown>> {
    return baseApi.get<GetBatchActivityAnalyticsResponseDTO>(
      `/api/activities/analytics`,
      {
        params: {
          activityIds: data.activityIds,
          fromDate: data.fromDate,
          toDate: data.toDate,
        },
      },
    );
  }

  getSessionSegment(data: GetActivitySessionSegmentDTO) {
    return baseApi.get<ActivitySessionSegmentDTO>(
      `/api/session-segments/${data.segmentId}`,
    );
  }
}

export const activityApiService = new ActivityService();
