import type { GetTagDataDTO, TagDTO } from "@to-do-list/shared";
import { baseApi } from "../base";

export class TagService {
  getTagById({ id }: GetTagDataDTO) {
    return baseApi.get<TagDTO>(`/api/tags/${id}`);
  }
}

export const tagApiService = new TagService();
