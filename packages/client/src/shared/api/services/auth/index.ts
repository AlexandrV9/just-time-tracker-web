import type { AuthUserDTO, ErrorField } from "./types";
import type { RequestResponse } from "../types";
import { tokenManager } from "~/shared/utils";
import { authApi, baseApi } from "../base";
import type { UserDTO } from "../users/types";

class AuthService {
  signInByLogin(data: { login: string; password: string }) {
    return authApi.post<{ user: AuthUserDTO; accessToken: string }>(
      `/api/auth/sign-in`,
      { data },
    );
  }

  signUp(data: { firstName: string; login: string; password: string }) {
    return authApi.post<UserDTO, ErrorField[]>(`/api/auth/sign-up`, {
      data,
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
    return baseApi.post<RequestResponse>(`/api/auth/sign-out`);
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
}

export const authService = new AuthService();

export * from "./types";
