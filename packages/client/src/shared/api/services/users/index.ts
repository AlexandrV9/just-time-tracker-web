import type { ProfileUserDTO, UpdateProfileDataDTO } from "@to-do-list/shared";
import { baseApi } from "../base";

export type AuthProviderDTO = {
  provider: string;
  createdAt: string;
};

class UserService {
  updateProfile(data: UpdateProfileDataDTO) {
    return baseApi.patch<ProfileUserDTO>(`/api/users/me`, { data });
  }

  getAuthProviders() {
    return baseApi.get<AuthProviderDTO[]>(`/api/users/me/auth-providers`);
  }

  startYandexLink() {
    return baseApi.post<{ redirectUrl: string }>(`/api/auth/yandex/link`);
  }
}

export const userApiService = new UserService();
