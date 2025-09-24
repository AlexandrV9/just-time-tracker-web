import { authService } from "~/shared/api";
import { authActions, useAuthStore } from "./useAuthStore";
import { tokenManager } from "~/shared/utils";

class AuthManager {
  async checkAuth(): Promise<boolean> {
    try {
      authActions.setStatus("PENDING");

      const response = await authService.checkIsAuth();
      const { data, success, message } = response.data;

      if (!success) {
        throw new Error(message || "Authentication failed");
      }

      if (data?.accessToken) {
        tokenManager.setAccessToken(data.accessToken);
      }

      if (data?.user) {
        authActions.setUser(data.user);
      }

      authActions.setStatus("AUTHENTICATED");
      return true;
    } catch (error) {
      console.log(error);

      tokenManager.removeAccessToken();

      authActions.setStatus("UNAUTHENTICATED");
      return false;
    }
  }

  async signInByLogin(credentials: { login: string; password: string }) {
    try {
      authActions.setStatus("PENDING");

      const response = await authService.signInByLogin(credentials);
      const { data, message, success } = response.data;

      if (!success || !data) {
        throw new Error(message || "Request failed");
      }

      authActions.setUser(data.user);
      authActions.setStatus("AUTHENTICATED");
      tokenManager.setAccessToken(data.accessToken);
      return response;
    } catch (error) {
      console.log(error);
      authActions.setStatus("UNAUTHENTICATED");
      throw error;
    }
  }

  async signUp(value: { name?: string; login: string; password: string }) {
    try {
      const response = await authService.signUp(value);
      const { data, message, success } = response.data;

      if (!success || !data) {
        throw new Error(message || "Request failed");
      }

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async signOut() {
    const currentStatus = useAuthStore.getState().status;

    try {
      authActions.setStatus("PENDING");

      const response = await authService.signOut();
      const { message, success } = response.data;

      if (!success) {
        throw new Error(message || "Request failed");
      }

      tokenManager.removeAccessToken();
      authActions.setStatus("UNAUTHENTICATED");

      return response.data;
    } catch (error) {
      console.log(error);
      authActions.setStatus(currentStatus);
    }
  }
}

export const authManager = new AuthManager();
