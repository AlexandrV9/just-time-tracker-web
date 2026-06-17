import type {
  ConfirmPasswordResetDataDTO,
  ConfirmPasswordResetResultDTO,
  PasswordResetStateDTO,
  PasswordResetStatusDTO,
  StartPasswordResetDataDTO,
  VerifyPasswordResetDataDTO,
  VerifyPasswordResetResultDTO,
} from "@to-do-list/shared";
import type { AuthUserDTO, ErrorField } from "./types";
import type { RequestResponse } from "../types";
import { tokenManager } from "~/shared/utils";
import { authApi, baseApi } from "../base";

class AuthService {
  signInByLogin(data: { login: string; password: string }) {
    return authApi.post<{ user: AuthUserDTO; accessToken: string }>(
      `/api/auth/sign-in`,
      { data },
    );
  }

  signUp(data: { firstName: string; login: string; password: string }) {
    return authApi.post<
      { user: AuthUserDTO; accessToken: string },
      ErrorField[]
    >(`/api/auth/sign-up`, {
      data,
      withCredentials: true,
    });
  }

  checkIsAuth() {
    return authApi.get<{ user: AuthUserDTO; accessToken?: string }, unknown>(
      `/api/auth`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${tokenManager.getAccessToken()}`,
        },
      },
    );
  }

  signOut() {
    return baseApi.post<RequestResponse>(`/api/auth/sign-out`, {
      withCredentials: true,
    });
  }

  // checkRefresh() {
  //   return axios.get<RequestResponse<{ hasRefreshToken: boolean }>>(
  //     `${apiEndpoint}/auth/check-refresh`,
  //     {
  //       withCredentials: true,
  //     }
  //   );
  // }

  refresh() {
    return baseApi.get<{ accessToken: string }>(`/api/auth/refresh`, {
      withCredentials: true,
    });
  }

  getPasswordResetStatus(data: StartPasswordResetDataDTO) {
    return authApi.post<PasswordResetStatusDTO>(
      `/api/auth/password-reset/status`,
      { data },
    );
  }

  startPasswordReset(data: StartPasswordResetDataDTO) {
    return authApi.post<PasswordResetStateDTO>(
      `/api/auth/password-reset/start`,
      { data },
    );
  }

  verifyPasswordReset(data: VerifyPasswordResetDataDTO) {
    return authApi.post<VerifyPasswordResetResultDTO>(
      `/api/auth/password-reset/verify`,
      { data },
    );
  }

  resendPasswordReset(data: StartPasswordResetDataDTO) {
    return authApi.post<PasswordResetStateDTO>(
      `/api/auth/password-reset/resend`,
      { data },
    );
  }

  confirmPasswordReset(data: ConfirmPasswordResetDataDTO) {
    return authApi.post<ConfirmPasswordResetResultDTO>(
      `/api/auth/password-reset/confirm`,
      { data },
    );
  }
}

export const authService = new AuthService();

export * from "./types";
