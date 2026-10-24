import type { WithCreatedById } from "../shared/auth/with-created-by-id.js";
import type {
  CreateDayPlanDataDTO,
  DayPlanDTO,
  DeleteDayPlanDataDTO,
  GetDayPlanDTO,
  GetDayPlansByRangeDTO,
  GetDayPlansByRangeResponseDTO,
  GetDayPlansDTO,
  GetDayPlansResponseDTO,
  UpdateDayPlanDataDTO,
} from "@time-tracker/shared";

import { dayPlanQueries } from "./dayPlan.queries.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";

const PG_UNIQUE = "23505";

function isPgError(e: unknown): e is { code?: string } {
  return typeof e === "object" && e !== null && "code" in e;
}

type CreateDayPlanResponse = SuccessResponse<DayPlanDTO> | ErrorResponse;

const createDayPlan = async (
  data: WithCreatedById<CreateDayPlanDataDTO>,
): Promise<CreateDayPlanResponse> => {
  try {
    const entry = await dayPlanQueries.createDayPlan(data);
    return { success: true, data: entry };
  } catch (error) {
    if (isPgError(error) && error.code === PG_UNIQUE) {
      return {
        success: false,
        message: "Day plan for this date already exists",
      };
    }
    console.error("Create day plan error:", error);
    return { success: false, message: "Failed to create day plan" };
  }
};

type GetDayPlanByIdResponse = SuccessResponse<DayPlanDTO> | ErrorResponse;

const getDayPlanById = async (
  data: GetDayPlanDTO,
): Promise<GetDayPlanByIdResponse> => {
  try {
    const entry = await dayPlanQueries.getDayPlanById(data.id);
    if (!entry) {
      return { success: false, message: "Day plan not found" };
    }
    return { success: true, data: entry };
  } catch (error) {
    console.error("Get day plan error:", error);
    return { success: false, message: "Failed to get day plan" };
  }
};

type GetDayPlansResponse =
  | SuccessResponse<GetDayPlansResponseDTO>
  | ErrorResponse;

const getDayPlans = async (
  filters: WithCreatedById<GetDayPlansDTO>,
): Promise<GetDayPlansResponse> => {
  try {
    const result = await dayPlanQueries.getDayPlans(filters);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("List day plans error:", error);
    return { success: false, message: "Failed to fetch day plans" };
  }
};

type GetDayPlansByRangeResponse =
  | SuccessResponse<GetDayPlansByRangeResponseDTO>
  | ErrorResponse;

const getDayPlansByRange = async (
  filters: WithCreatedById<GetDayPlansByRangeDTO>,
): Promise<GetDayPlansByRangeResponse> => {
  try {
    const data = await dayPlanQueries.getDayPlansByRange(filters);
    return { success: true, data };
  } catch (error) {
    console.error("List day plans by range error:", error);
    return { success: false, message: "Failed to fetch day plans by range" };
  }
};

type UpdateDayPlanResponse = SuccessResponse<DayPlanDTO> | ErrorResponse;

const updateDayPlan = async (
  data: UpdateDayPlanDataDTO,
): Promise<UpdateDayPlanResponse> => {
  try {
    const entry = await dayPlanQueries.updateDayPlan(data);
    if (!entry) {
      return { success: false, message: "Day plan not found" };
    }
    return { success: true, data: entry };
  } catch (error) {
    if (isPgError(error) && error.code === PG_UNIQUE) {
      return {
        success: false,
        message: "Day plan for this date already exists",
      };
    }
    console.error("Update day plan error:", error);
    return { success: false, message: "Failed to update day plan" };
  }
};

type DeleteDayPlanResponse = SuccessResponse<null> | ErrorResponse;

const deleteDayPlan = async (
  data: DeleteDayPlanDataDTO,
): Promise<DeleteDayPlanResponse> => {
  try {
    const existing = await dayPlanQueries.getDayPlanById(data.id);
    if (!existing) {
      return { success: false, message: "Day plan not found" };
    }
    await dayPlanQueries.deleteDayPlan(data.id);
    return { success: true, data: null };
  } catch (error) {
    console.error("Delete day plan error:", error);
    return { success: false, message: "Failed to delete day plan" };
  }
};

export const dayPlansService = {
  createDayPlan,
  getDayPlanById,
  getDayPlans,
  getDayPlansByRange,
  updateDayPlan,
  deleteDayPlan,
};
