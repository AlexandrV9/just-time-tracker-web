import type {
  CreateDayPlanDataDTO,
  CreateDayPlanItemDataDTO,
  DayPlanDTO,
  DayPlanItemDTO,
  GetDayPlanItemsDTO,
  GetDayPlansDTO,
  GetDayPlanItemsResponseDTO,
  GetDayPlansResponseDTO,
  AddDayPlanItemsDataDTO,
} from "@to-do-list/shared";

import { baseApi } from "../base";
import type { RequestResponse } from "../types";

export class DayPlanService {
  getDayPlans(data?: GetDayPlansDTO) {
    return baseApi.get<GetDayPlansResponseDTO>(`/api/day-plans`, {
      params: data,
    });
  }

  createDayPlan(data: CreateDayPlanDataDTO) {
    return baseApi.post<DayPlanDTO>(`/api/day-plans`, { data });
  }

  getDayPlanItems(params?: GetDayPlanItemsDTO) {
    return baseApi.get<GetDayPlanItemsResponseDTO>(`/api/day-plan-items`, {
      params,
    });
  }

  createDayPlanItem(data: CreateDayPlanItemDataDTO) {
    return baseApi.post<DayPlanItemDTO>(`/api/day-plan-items`, { data });
  }

  deleteDayPlanItem(id: string): Promise<RequestResponse<boolean>> {
    return baseApi.delete<boolean>(`/api/day-plan-items/${id}`);
  }

  addDayPlanItems(
    data: AddDayPlanItemsDataDTO,
  ): Promise<RequestResponse<DayPlanItemDTO[]>> {
    return baseApi.post<DayPlanItemDTO[]>(`/api/day-plan-items/batch`, { data });
  }
}

export const dayPlanApiService = new DayPlanService();
