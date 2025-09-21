import type { AuthUserDTO } from "./types";
import type { RequestResponse } from "../types";
import axios from "axios";
import { axiosInstance } from "../../../config/axios";

class AuthService {
  signInByLogin(data: { login: string; password: string }) {
    return axiosInstance.post<
      RequestResponse<{ user: AuthUserDTO; accessToken: string }>
    >(`/api/auth/sign-in`, data);
  }

  signUp(data: { login: string; name?: string; password: string }) {
    return axiosInstance.post<RequestResponse>(`/api/auth/sign-up`, data);
  }

  checkIsAuth() {
    return axios.get<
      RequestResponse<{ user: AuthUserDTO; accessToken?: string }>
    >(`/api/auth`, {
      withCredentials: true,
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
