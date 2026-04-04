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
  GetActivitiesResponseDTO,
  PauseActivityDTO,
  FinishActivityDTO,
  GetActivitySessionsDTO,
  GetActivitySessionsResponseDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";
import type { RequestResponse } from "../types";

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
    return baseApi.get<{
      session: ActivitySessionDTO;
      segment: ActivitySessionSegmentDTO | null;
    }>(`/api/activity-sessions/${data.id}`);
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
}

export const activityApiService = new ActivityService();
