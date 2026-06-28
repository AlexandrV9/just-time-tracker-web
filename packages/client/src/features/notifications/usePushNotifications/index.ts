import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "~/features/auth";
import { pushApiService } from "~/shared/api/services";
import {
  getExistingPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "~/shared/services/pushNotifications";
import { useShallow } from "zustand/react/shallow";

export async function registerPushSubscription() {
  if (!isPushSupported()) {
    return false;
  }

  const subscription = await subscribeToPush();
  const response = await pushApiService.registerSubscription(subscription);

  return response.success;
}

export async function unregisterPushSubscription() {
  const existing = await getExistingPushSubscription();

  if (existing) {
    await pushApiService.unregisterSubscription({
      endpoint: existing.endpoint,
    });
    await existing.unsubscribe();
    return;
  }

  await unsubscribeFromPush();
}

export function usePushNotifications() {
  const { status, user } = useAuthStore(
    useShallow((state) => ({
      status: state.status,
      user: state.user,
    })),
  );
  const isRegisteringRef = useRef(false);

  const syncPushSubscription = useCallback(async () => {
    if (
      status !== "AUTHENTICATED" ||
      !user?.pushNotificationsEnabled ||
      !isPushSupported() ||
      !import.meta.env.VITE_VAPID_PUBLIC_KEY
    ) {
      return;
    }

    if (isRegisteringRef.current) {
      return;
    }

    isRegisteringRef.current = true;

    try {
      await registerPushSubscription();
    } catch (error) {
      console.warn("Failed to register push subscription:", error);
    } finally {
      isRegisteringRef.current = false;
    }
  }, [status, user?.pushNotificationsEnabled]);

  useEffect(() => {
    void syncPushSubscription();
  }, [syncPushSubscription]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      void syncPushSubscription();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, [syncPushSubscription]);
}
