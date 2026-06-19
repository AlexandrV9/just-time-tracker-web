import type { GetTagDataDTO, TagDTO } from "@time-tracker/shared";
import { baseApi } from "../base";

export class TagService {
  getTagById({ id }: GetTagDataDTO) {
    return baseApi.get<TagDTO>(`/api/tags/${id}`);
  }
}

export const tagApiService = new TagService();
