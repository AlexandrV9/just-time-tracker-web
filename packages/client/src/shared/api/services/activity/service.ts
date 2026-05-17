import type {
  CreateActivityDataDTO,
  DeleteActivityDataDTO,
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
  UpdateActivityDataDTO,
  GetActivitySessionDTO,
  GetActivityDTO,
  GetActivitiesDTO,
  GetActivitiesByIdsDTO,
  GetActivitiesResponseDTO,
  GetCurrentActivitiesQueryDTO,
  GetCurrentActivitiesResponseDTO,
  GetActivitySessionsDTO,
  GetActivitySessionsResponseDTO,
  GetActivitySessionSegmentDTO,
  GetActivityAnalyticsDTO,
  GetActivityAnalyticsResponseDTO,
  GetGroupedActivitiesQueryDTO,
  GetGroupedActivitiesResponseDTO,
  GetGroupedActivityItemsQueryDTO,
  GetGroupedActivityItemsResponseDTO,
  GetActivitiesAnalyticsResponseDTO,
  GetActivitiesAnalyticsQueryDTO,
  GetActivitySessionSegmentsDTO,
  GetActivitySessionSegmentsResponseDTO,
  StartActivityDataDTO,
  FinishActivityDataDTO,
  PauseActivityDataDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";
import type { RequestResponse } from "../types";

type DeleteActivitySessionDTO = { id: string };

export class ActivityService {
  createActivity(data: CreateActivityDataDTO) {
    return baseApi.post<ActivityDTO>(`/api/activities`, { data });
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

  getCurrentActivities(data: GetCurrentActivitiesQueryDTO) {
    return baseApi.get<GetCurrentActivitiesResponseDTO>(
      `/api/activities/current`,
      {
        params: data,
      },
    );
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

  startActivity(data: StartActivityDataDTO) {
    return baseApi.post<{
      activity: ActivityDTO;
      session: ActivitySessionDTO;
      segment: ActivitySessionSegmentDTO;
    }>(`/api/activities/start`, { data });
  }

  pauseActivity(data: PauseActivityDataDTO) {
    return baseApi.post<{
      activity: ActivityDTO;
      session: ActivitySessionDTO;
      segment: ActivitySessionSegmentDTO | null;
    }>(`/api/activities/pause`, { data });
  }

  finishActivity(data: FinishActivityDataDTO) {
    return baseApi.post<{
      activity: ActivityDTO;
      session: ActivitySessionDTO;
      segment: ActivitySessionSegmentDTO | null;
    }>(`/api/activities/finish`, { data });
  }

  getActivitySession(data: GetActivitySessionDTO) {
    return baseApi.get<ActivitySessionDTO>(`/api/activity-sessions/${data.id}`);
  }

  deleteActivitySession(data: DeleteActivitySessionDTO) {
    return baseApi.delete<boolean>(`/api/activity-sessions/${data.id}`);
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

  getActivitySessionSegments(
    data: GetActivitySessionSegmentsDTO,
  ): Promise<RequestResponse<GetActivitySessionSegmentsResponseDTO, unknown>> {
    const { activityId, fromDate, toDate } = data;
    return baseApi.get<GetActivitySessionSegmentsResponseDTO>(
      `/api/activities/${activityId}/session-segments`,
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

  getActivitiesAnalytics(
    data: GetActivitiesAnalyticsQueryDTO,
  ): Promise<RequestResponse<GetActivitiesAnalyticsResponseDTO, unknown>> {
    return baseApi.get<GetActivitiesAnalyticsResponseDTO>(
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
      `/api/activity-session-segments/${data.segmentId}`,
    );
  }

  getGroupedActivities(data?: GetGroupedActivitiesQueryDTO) {
    return baseApi.get<GetGroupedActivitiesResponseDTO>(
      `/api/activities/grouped`,
      { params: data },
    );
  }

  getGroupedActivityItems(
    data: GetGroupedActivityItemsQueryDTO,
  ): Promise<RequestResponse<GetGroupedActivityItemsResponseDTO, unknown>> {
    return baseApi.get<GetGroupedActivityItemsResponseDTO>(
      `/api/activities/grouped/items`,
      { params: data },
    );
  }
}

export const activityApiService = new ActivityService();
