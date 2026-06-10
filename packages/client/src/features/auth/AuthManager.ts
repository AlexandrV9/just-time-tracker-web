import { authService, type ErrorField } from "~/shared/api";
import { authActions, useAuthStore } from "./useAuthStore";
import { getJwtUserId, isUuid, tokenManager } from "~/shared/utils";
import axios from "axios";
import { ApiError } from "~/shared/config/error";

class AuthManager {
  async checkAuth(): Promise<boolean> {
    try {
      authActions.setStatus("PENDING");

      const accessToken = tokenManager.getAccessToken();
      const tokenUserId = accessToken ? getJwtUserId(accessToken) : null;

      if (tokenUserId && !isUuid(tokenUserId)) {
        tokenManager.removeAccessToken();
        await authService.signOut().catch(() => undefined);
        authActions.setStatus("UNAUTHENTICATED");
        return false;
      }

      const response = await authService.checkIsAuth();

      if (!response.success) {
        console.log("error", response.message);
        tokenManager.removeAccessToken();
        return false;
      }

      if (response.data.accessToken) {
        tokenManager.setAccessToken(response.data.accessToken);
      }

      if (response.data.user) {
        authActions.setUser({
          ...response.data.user,
          id: response.data.user.id.toString(),
        });
      }

      authActions.setStatus("AUTHENTICATED");
      return true;
    } catch (error) {
      console.error(error);

      tokenManager.removeAccessToken();

      authActions.setStatus("UNAUTHENTICATED");
      return false;
    }
  }

  async signInByLogin(credentials: { login: string; password: string }) {
    try {
      authActions.setStatus("PENDING");

      const response = await authService.signInByLogin(credentials);

      if (!response.success) {
        return response;
      }

      authActions.setUser({
        ...response.data.user,
        id: response.data.user.id.toString(),
      });
      authActions.setStatus("AUTHENTICATED");
      tokenManager.setAccessToken(response.data.accessToken);
      return response;
    } catch (error) {
      authActions.setStatus("UNAUTHENTICATED");

      if (axios.isAxiosError(error)) {
        throw ApiError.fromResponse({
          message: error.response?.data?.message,
          code: error.response?.status,
        });
      } else {
        console.log("another error", error);
        throw error;
      }
    }
  }

  async signUp(value: { firstName: string; login: string; password: string }) {
    try {
      authActions.setStatus("PENDING");

      const response = await authService.signUp(value);

      if (!response.success) {
        authActions.setStatus("UNAUTHENTICATED");
        return response;
      }

      authActions.setUser({
        ...response.data.user,
        id: response.data.user.id.toString(),
      });
      authActions.setStatus("AUTHENTICATED");
      tokenManager.setAccessToken(response.data.accessToken);

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error as ApiError<ErrorField[] | null>;
      }

      if (axios.isAxiosError(error)) {
        throw ApiError.fromResponse<ErrorField[] | null>({
          message: error.response?.data?.message,
          code: error.response?.status,
          data: error.response?.data?.data || [],
        });
      }

      console.log("Unknown error", error);
      throw ApiError.fromResponse<null>({
        message: "Unknown error",
      });
    }
  }

  async signOut() {
    const currentStatus = useAuthStore.getState().status;

    try {
      authActions.setStatus("PENDING");

      const response = await authService.signOut();

      if (!response.success) {
        return response;
      }

      tokenManager.removeAccessToken();
      authActions.setStatus("UNAUTHENTICATED");

      return response;
    } catch (error) {
      console.error(error);
      authActions.setStatus(currentStatus);
    }
  }
}

export const authManager = new AuthManager();
