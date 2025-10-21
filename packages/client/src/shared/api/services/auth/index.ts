import type { AuthUserDTO, ErrorField } from "./types";
import type { RequestResponse } from "../types";
import axios from "axios";
import { axiosInstance } from "../../../config/axios";
import { tokenManager } from "~/shared/utils";
import type { UserDTO } from "../users";

class AuthService {
  signInByLogin(data: { login: string; password: string }) {
    return axios.post<
      RequestResponse<{ user: AuthUserDTO; accessToken: string }>
    >(`/api/auth/sign-in`, data);
  }

  signUp(data: { login: string; name?: string; password: string }) {
    return axiosInstance.post<RequestResponse<UserDTO, ErrorField[]>>(
      `/api/auth/sign-up`,
      data
    );
  }

  checkIsAuth() {
    return axios.get<
      RequestResponse<{ user: AuthUserDTO; accessToken?: string }>
    >(`/api/auth`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${tokenManager.getAccessToken()}`,
      },
    });
  }

  signOut() {
    return axiosInstance.post<RequestResponse>(`/api/auth/sign-out`);
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
    return axios.get<RequestResponse<{ accessToken: string }>>(
      `/api/auth/refresh`,
      {
        withCredentials: true,
      }
    );
  }
}

export const authService = new AuthService();

export * from "./types";
