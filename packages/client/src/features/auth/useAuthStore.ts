import { devtools } from "zustand/middleware";
import { create } from "zustand";
import type { AuthStatus, AuthUser } from "./types";

type AuthStore = {
  user: AuthUser | null;
  status: AuthStatus;
};

export const authActions = {
  setStatus: (status: AuthStatus) => useAuthStore.setState({ status }),
  setUser: (user: AuthUser | null) => useAuthStore.setState({ user }),
  reset: () => useAuthStore.setState({ status: "IDLE", user: null }),
};

export const useAuthStore = create<AuthStore>()(
  devtools(() => ({
    status: "IDLE",
    user: null,
  })),
);
