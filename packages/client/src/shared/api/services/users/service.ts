import type {
  ProfileUserDTO,
  SetPasswordDataDTO,
  UpdatePasswordDataDTO,
  UpdateProfileDataDTO,
} from "@time-tracker/shared";
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

  unlinkProvider(provider: string) {
    return baseApi.delete<null>(`/api/users/me/auth-providers/${provider}`);
  }

  setPassword(data: SetPasswordDataDTO) {
    return baseApi.post<null>(`/api/users/me/password`, { data });
  }

  updatePassword(data: UpdatePasswordDataDTO) {
    return baseApi.patch<null>(`/api/users/me/password`, { data });
  }
}

export const userApiService = new UserService();
