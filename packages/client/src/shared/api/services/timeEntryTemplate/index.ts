import type {
  CreateTimeEntryTemplateDataDTO,
  DeleteTimeEntryTemplateDataDTO,
  TimeEntryTemplateDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";
import type { RequestResponse } from "../types";

export class TimeEntryTemplateService {
  getTimeEntryTemplates(data?: { createdById?: string }) {
    return baseApi.get<TimeEntryTemplateDTO[]>(`/api/time-entry-templates`, {
      params: data,
    });
  }

  createTimeEntryTemplate(data: CreateTimeEntryTemplateDataDTO) {
    return baseApi.post<TimeEntryTemplateDTO>(`/api/time-entry-templates`, {
      data,
    });
  }

  deleteTimeEntryTemplate(data: DeleteTimeEntryTemplateDataDTO) {
    return baseApi.delete<RequestResponse<null>>(
      `/api/time-entry-templates/${data.id}`,
    );
  }
}

export const timeEntryTemplateApiService = new TimeEntryTemplateService();
