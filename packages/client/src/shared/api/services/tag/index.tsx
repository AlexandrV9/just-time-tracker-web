import type { GetTagDataDTO, TaskDTO } from "@to-do-list/shared";
import { baseApi } from "../base";

export class TagService {
  getTagById({ id: taskId }: GetTagDataDTO) {
    return baseApi.get<TaskDTO>(`/api/tasks/${taskId}`);
  }
}

export const tagApiService = new TagService();
