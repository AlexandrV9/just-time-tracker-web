import type { ProfileUserDTO, UpdateProfileDataDTO } from "@to-do-list/shared";
import { baseApi } from "../base";

class UserService {
  updateProfile(data: UpdateProfileDataDTO) {
    return baseApi.patch<ProfileUserDTO>(`/api/users/me`, { data });
  }
}

export const userApiService = new UserService();
