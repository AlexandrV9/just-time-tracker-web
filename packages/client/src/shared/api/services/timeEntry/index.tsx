import type {
  CreateTimeEntryDataDTO,
  DeleteTimeEntryDataDTO,
  GetTimeEntriesQueryDTO,
  GetTimeEntriesResponseDTO,
  GetTimeEntryDataDTO,
  TimeEntryDTO,
  UpdateTimeEntryDataDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";
import type { RequestResponse } from "../types";

export class TimeEntryService {
  getTimeEntryById({
    id,
  }: GetTimeEntryDataDTO): Promise<RequestResponse<TimeEntryDTO, unknown>> {
    return baseApi.get<TimeEntryDTO>(`/api/time-entries/${id}`);
  }

  getTimeEntries(data?: GetTimeEntriesQueryDTO) {
    return baseApi.get<GetTimeEntriesResponseDTO>(`/api/time-entries`, {
      params: data,
    });
  }

  createTimeEntry(data: CreateTimeEntryDataDTO) {
    return baseApi.post<TimeEntryDTO>(`/api/time-entries`, { data });
  }

  updateTimeEntry(data: UpdateTimeEntryDataDTO) {
    return baseApi.patch<TimeEntryDTO>(`/api/time-entries`, { data });
  }

  deleteTimeEntry(data: DeleteTimeEntryDataDTO) {
    return baseApi.delete<boolean>(`/api/time-entries/${data.id}`);
  }
}

export const timeEntryApiService = new TimeEntryService();
