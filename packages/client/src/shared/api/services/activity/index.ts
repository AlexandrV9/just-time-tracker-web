import type {
  CreateActivityDataDTO,
  DeleteActivityDataDTO,
  GetActivitiesQueryDTO,
  GetActivitiesResponseDTO,
  GetActivityDataDTO,
  ActivityDTO,
  UpdateActivityDataDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";
import type { RequestResponse } from "../types";

export class ActivityService {
  getActivityById({
    id,
  }: GetActivityDataDTO): Promise<RequestResponse<ActivityDTO, unknown>> {
    return baseApi.get<ActivityDTO>(`/api/activities/${id}`);
  }

  getActivities(data?: GetActivitiesQueryDTO) {
    return baseApi.get<GetActivitiesResponseDTO>(`/api/activities`, {
      params: data,
    });
  }

  createActivity(data: CreateActivityDataDTO) {
    return baseApi.post<ActivityDTO>(`/api/activities`, { data });
  }

  updateActivity(data: UpdateActivityDataDTO) {
    return baseApi.patch<ActivityDTO>(`/api/activities`, { data });
  }

  deleteActivity(data: DeleteActivityDataDTO) {
    return baseApi.delete<boolean>(`/api/activities/${data.id}`);
  }
}

export const activityApiService = new ActivityService();
