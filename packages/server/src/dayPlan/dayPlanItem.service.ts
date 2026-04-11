import type {
  CreateDayPlanItemDataDTO,
  DayPlanItemDTO,
  DeleteDayPlanItemDataDTO,
  GetDayPlanItemDTO,
  GetDayPlanItemsDTO,
  GetDayPlanItemsResponseDTO,
  UpdateDayPlanItemDataDTO,
} from "@to-do-list/shared";

import { dayPlanItemQueries } from "./dayPlanItem.queries.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";

const PG_UNIQUE = "23505";
const PG_FK = "23503";

function isPgError(e: unknown): e is { code?: string } {
  return typeof e === "object" && e !== null && "code" in e;
}

type CreateDayPlanItemResponse = SuccessResponse<DayPlanItemDTO> | ErrorResponse;

const createDayPlanItem = async (
  data: CreateDayPlanItemDataDTO,
): Promise<CreateDayPlanItemResponse> => {
  try {
    const entry = await dayPlanItemQueries.createDayPlanItem(data);
    return { success: true, data: entry };
  } catch (error) {
    if (isPgError(error) && error.code === PG_UNIQUE) {
      return {
        success: false,
        message: "This activity is already in the day plan",
      };
    }
    if (isPgError(error) && error.code === PG_FK) {
      return {
        success: false,
        message: "Invalid day plan or activity",
      };
    }
    console.error("Create day plan item error:", error);
    return { success: false, message: "Failed to create day plan item" };
  }
};

type GetDayPlanItemByIdResponse =
  | SuccessResponse<DayPlanItemDTO>
  | ErrorResponse;

const getDayPlanItemById = async (
  data: GetDayPlanItemDTO,
): Promise<GetDayPlanItemByIdResponse> => {
  try {
    const entry = await dayPlanItemQueries.getDayPlanItemById(data.id);
    if (!entry) {
      return { success: false, message: "Day plan item not found" };
    }
    return { success: true, data: entry };
  } catch (error) {
    console.error("Get day plan item error:", error);
    return { success: false, message: "Failed to get day plan item" };
  }
};

type GetDayPlanItemsResponse =
  | SuccessResponse<GetDayPlanItemsResponseDTO>
  | ErrorResponse;

const getDayPlanItems = async (
  filters: GetDayPlanItemsDTO,
): Promise<GetDayPlanItemsResponse> => {
  try {
    const result = await dayPlanItemQueries.getDayPlanItems(filters);
    return { success: true, data: result };
  } catch (error) {
    console.error("List day plan items error:", error);
    return { success: false, message: "Failed to fetch day plan items" };
  }
};

type UpdateDayPlanItemResponse = SuccessResponse<DayPlanItemDTO> | ErrorResponse;

const updateDayPlanItem = async (
  data: UpdateDayPlanItemDataDTO,
): Promise<UpdateDayPlanItemResponse> => {
  try {
    const entry = await dayPlanItemQueries.updateDayPlanItem(data);
    if (!entry) {
      return { success: false, message: "Day plan item not found" };
    }
    return { success: true, data: entry };
  } catch (error) {
    if (isPgError(error) && error.code === PG_UNIQUE) {
      return {
        success: false,
        message: "This activity is already in the day plan",
      };
    }
    if (isPgError(error) && error.code === PG_FK) {
      return {
        success: false,
        message: "Invalid activity",
      };
    }
    console.error("Update day plan item error:", error);
    return { success: false, message: "Failed to update day plan item" };
  }
};

type DeleteDayPlanItemResponse = SuccessResponse<null> | ErrorResponse;

const deleteDayPlanItem = async (
  data: DeleteDayPlanItemDataDTO,
): Promise<DeleteDayPlanItemResponse> => {
  try {
    const existing = await dayPlanItemQueries.getDayPlanItemById(data.id);
    if (!existing) {
      return { success: false, message: "Day plan item not found" };
    }
    await dayPlanItemQueries.deleteDayPlanItem(data.id);
    return { success: true, data: null };
  } catch (error) {
    console.error("Delete day plan item error:", error);
    return { success: false, message: "Failed to delete day plan item" };
  }
};

export const dayPlanItemsService = {
  createDayPlanItem,
  getDayPlanItemById,
  getDayPlanItems,
  updateDayPlanItem,
  deleteDayPlanItem,
};
