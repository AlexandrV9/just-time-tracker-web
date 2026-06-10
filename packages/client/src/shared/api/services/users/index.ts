import type {
  ConfirmEmailVerificationDataDTO,
  ConfirmEmailVerificationResultDTO,
  EmailVerificationStateDTO,
  ProfileUserDTO,
  SetPasswordDataDTO,
  StartEmailVerificationDataDTO,
  UpdateProfileDataDTO,
} from "@to-do-list/shared";
import { baseApi } from "../base";

export type AuthProviderDTO = {
  provider: string;
  createdAt: string;
};

class UserService {
  updateProfile(data: UpdateProfileDataDTO) {
    return baseApi.patch<ProfileUserDTO>(`/api/users/me`, { data });
  }

  getEmailVerificationStatus() {
    return baseApi.get<EmailVerificationStateDTO>(
      `/api/email-verification/status`,
    );
  }

  startEmailVerification(data: StartEmailVerificationDataDTO) {
    return baseApi.post<EmailVerificationStateDTO>(
      `/api/email-verification/start`,
      { data },
    );
  }

  confirmEmailVerification(data: ConfirmEmailVerificationDataDTO) {
    return baseApi.post<ConfirmEmailVerificationResultDTO>(
      `/api/email-verification/confirm`,
      { data },
    );
  }

  resendEmailVerification() {
    return baseApi.post<EmailVerificationStateDTO>(
      `/api/email-verification/resend`,
    );
  }

  cancelEmailVerification() {
    return baseApi.post<EmailVerificationStateDTO>(
      `/api/email-verification/cancel`,
    );
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
}

export const userApiService = new UserService();
