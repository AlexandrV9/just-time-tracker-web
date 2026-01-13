import type {
  CreateTimeEntryDataDTO,
  UpdateTimeEntryDataDTO,
  GetTimeEntriesQueryDTO,
  TimeEntryDTO,
  GetTimeEntryDataDTO,
  GetTimeEntriesResponseDTO,
} from "@to-do-list/shared";

import { timeEntryRepository } from "./timeEntry.repository.js";
import { timeEntryQueries } from "./timeEntry.queries.js";
import type { ErrorResponse, SuccessResponse } from "src/shared/types.js";

type CreateTimeEntryResponse = SuccessResponse<TimeEntryDTO> | ErrorResponse;

const createTimeEntry = async (
  data: CreateTimeEntryDataDTO
): Promise<CreateTimeEntryResponse> => {
  try {
    const entry = await timeEntryRepository.createTimeEntry(data);

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Create time entry error:", error);

    return {
      success: false,
      message: "Failed to create time entry",
    };
  }
};

type UpdateTimeEntryResponse = SuccessResponse<TimeEntryDTO> | ErrorResponse;

const updateTimeEntry = async (
  data: UpdateTimeEntryDataDTO
): Promise<UpdateTimeEntryResponse> => {
  try {
    const entry = await timeEntryRepository.updateTimeEntry(data);

    if (!entry) {
      return {
        success: false,
        message: "Time entry not found",
      };
    }

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Update time entry error:", error);

    return {
      success: false,
      message: "Failed to update time entry",
    };
  }
};

type DeleteTimeEntryResponse = SuccessResponse<null> | ErrorResponse;

const deleteTimeEntry = async (data: {
  id: string;
}): Promise<DeleteTimeEntryResponse> => {
  try {
    const timeEntry = await timeEntryRepository.getTimeEntryById(data.id);

    if (!timeEntry) {
      return {
        success: false,
        message: "Time entry not found",
      };
    }

    await timeEntryRepository.deleteTimeEntry({ id: data.id });

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Delete time entry error:", error);

    return {
      success: false,
      message: "Failed to delete time entry",
    };
  }
};

type GetTimeEntryByIdResponse = SuccessResponse<TimeEntryDTO> | ErrorResponse;

const getTimeEntryById = async (
  data: GetTimeEntryDataDTO
): Promise<GetTimeEntryByIdResponse> => {
  try {
    const entry = await timeEntryRepository.getTimeEntryById(data.id);

    if (!entry) {
      return {
        success: false,
        message: "Time entry not found",
      };
    }

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    console.error("Get time entry error:", error);

    return {
      success: false,
      message: "Failed to get time entry",
    };
  }
};

type GetTimeEntriesByIdResponse =
  | SuccessResponse<GetTimeEntriesResponseDTO>
  | ErrorResponse;

const getTimeEntries = async (
  filters: GetTimeEntriesQueryDTO
): Promise<GetTimeEntriesByIdResponse> => {
  try {
    const result = await timeEntryQueries.getTimeEntries(filters);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Get time entries error:", error);

    return {
      success: false,
      message: "Failed to fetch time entries",
    };
  }
};

export const timeEntriesService = {
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeEntryById,
  getTimeEntries,
};
