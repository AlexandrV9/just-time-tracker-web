import type {
  CreateActivityDataDTO,
  UpdateActivityDataDTO,
  GetActivitiesDTO,
  ActivityDTO,
  GetActivityDTO,
  GetActivitiesResponseDTO,
} from "@to-do-list/shared";

import { activityRepository } from "./activity.repository.js";
import { activityQueries } from "./activity.queries.js";
import { DuplicateActivityTitleError } from "./activity.errors.js";
import {
  pauseActivitySession,
  playActivitySession,
} from "./activitySession.tracking.service.js";
import type { ErrorResponse, SuccessResponse } from "src/shared/types.js";

type CreateActivityResponse = SuccessResponse<ActivityDTO> | ErrorResponse;

const createActivity = async (
  data: CreateActivityDataDTO,
): Promise<CreateActivityResponse> => {
  try {
    const entry = await activityRepository.createActivity(data);

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Create activity error:", error);

    return {
      success: false,
      message: "Failed to create activity",
    };
  }
};

type UpdateActivityResponse = SuccessResponse<ActivityDTO> | ErrorResponse;

const updateActivity = async (
  data: UpdateActivityDataDTO,
): Promise<UpdateActivityResponse> => {
  try {
    const entry = await activityRepository.updateActivity(data);

    if (!entry) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    if (error instanceof DuplicateActivityTitleError) {
      return {
        success: false,
        message: "An activity with this name already exists",
      };
    }
    console.error("Update activity error:", error);

    return {
      success: false,
      message: "Failed to update activity",
    };
  }
};

type DeleteActivityResponse = SuccessResponse<null> | ErrorResponse;

const deleteActivity = async (data: {
  id: string;
}): Promise<DeleteActivityResponse> => {
  try {
    const activity = await activityRepository.getActivityById(data.id);

    if (!activity) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    await activityRepository.deleteActivity({ id: data.id });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Delete activity error:", error);

    return {
      success: false,
      message: "Failed to delete activity",
    };
  }
};

type GetActivityByIdResponse = SuccessResponse<ActivityDTO> | ErrorResponse;

const getActivityById = async (
  data: GetActivityDTO,
): Promise<GetActivityByIdResponse> => {
  try {
    const entry = await activityRepository.getActivityById(data.id);

    if (!entry) {
      return {
        success: false,
        message: "Activity not found",
      };
    }

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Get activity error:", error);

    return {
      success: false,
      message: "Failed to get activity",
    };
  }
};

type GetActivitiesResponse =
  | SuccessResponse<GetActivitiesResponseDTO>
  | ErrorResponse;

const getActivities = async (
  filters: GetActivitiesDTO,
): Promise<GetActivitiesResponse> => {
  try {
    const result = await activityQueries.getActivities(filters);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Get activities error:", error);

    return {
      success: false,
      message: "Failed to fetch activities",
    };
  }
};

type SessionTrackingResponse = Awaited<ReturnType<typeof playActivitySession>>;

const playSession = async (
  data: GetActivityDTO,
): Promise<SessionTrackingResponse> => {
  return playActivitySession(data.id);
};

const pauseSession = async (
  data: GetActivityDTO,
): Promise<SessionTrackingResponse> => {
  return pauseActivitySession(data.id);
};

export const activitiesService = {
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
  getActivities,
  playSession,
  pauseSession,
};
