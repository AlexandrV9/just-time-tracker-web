import { VAPID_PUBLIC_KEY } from "./constants";
import type { PushSubscriptionPayload } from "./types";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function mapSubscription(
  subscription: PushSubscription,
): PushSubscriptionPayload {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid push subscription");
  }

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    expirationTime: subscription.expirationTime,
  };
}

export function isPushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushPermission() {
  if (!isPushSupported()) return "denied" as NotificationPermission;
  return Notification.permission;
}

export async function requestPushPermission() {
  if (!isPushSupported()) return "denied" as NotificationPermission;
  return Notification.requestPermission();
}

export async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.ready;
}

export async function getExistingPushSubscription() {
  const registration = await getServiceWorkerRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(vapidPublicKey = VAPID_PUBLIC_KEY) {
  if (!vapidPublicKey) {
    throw new Error("VITE_VAPID_PUBLIC_KEY is not configured");
  }

  const permission = await requestPushPermission();
  if (permission !== "granted") {
    throw new Error(`Notification permission: ${permission}`);
  }

  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    throw new Error("Service worker is not ready");
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  return mapSubscription(subscription);
}

export async function unsubscribeFromPush() {
  const subscription = await getExistingPushSubscription();
  if (!subscription) return false;
  return subscription.unsubscribe();
}
