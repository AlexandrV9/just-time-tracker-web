import { NOTIFICATION_JOB_TYPES } from "@time-tracker/shared";
import { activityReminderEventSchema } from "@time-tracker/shared";
import i18n from "i18next";
import { useEffect, useRef } from "react";
import {
  NOTIFICATION_BADGE,
  NOTIFICATION_ICON,
} from "~/shared/constants";

const shownReminderTags = new Set<string>();

const REMINDER_CONTENT_KEYS: Record<
  string,
  { titleKey: string; bodyKey: string }
> = {
  [NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED]: {
    titleKey:
      "pages.activities.settings.notifications.goalReached.notificationTitle",
    bodyKey:
      "pages.activities.settings.notifications.goalReached.notificationBody",
  },
  [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_PAUSE]: {
    titleKey:
      "pages.activities.settings.notifications.longPause.notificationTitle",
    bodyKey:
      "pages.activities.settings.notifications.longPause.notificationBody",
  },
  [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY]: {
    titleKey:
      "pages.activities.settings.notifications.longActivity.notificationTitle",
    bodyKey:
      "pages.activities.settings.notifications.longActivity.notificationBody",
  },
};

const getReminderContent = (
  reminderType: string,
  activityTitle: string,
  fallback: { title: string; body: string },
) => {
  const keys = REMINDER_CONTENT_KEYS[reminderType];
  if (!keys) {
    return fallback;
  }

  return {
    title: i18n.t(keys.titleKey),
    body: i18n.t(keys.bodyKey, { activityTitle }),
  };
};

const showBrowserNotification = async (
  title: string,
  body: string,
  tag: string,
) => {
  if (shownReminderTags.has(tag)) {
    return;
  }

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission !== "granted") {
    return;
  }

  shownReminderTags.add(tag);

  const options: NotificationOptions = {
    body,
    tag,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.active) {
      await registration.showNotification(title, options);
      return;
    }
  }

  new Notification(title, options);
};

export const handleActivityReminderEvent = (rawData: string) => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawData);
  } catch {
    return false;
  }

  const result = activityReminderEventSchema.safeParse(parsed);
  if (!result.success) {
    return false;
  }

  const { data } = result.data;
  const tag = `reminder:${data.jobId}:${data.reminderType}`;
  const { title, body } = getReminderContent(data.reminderType, data.title, {
    title: data.title,
    body: data.body,
  });

  void showBrowserNotification(title, body, tag);
  return true;
};

export function useActivityReminders() {
  const handlerRef = useRef(handleActivityReminderEvent);
  handlerRef.current = handleActivityReminderEvent;

  useEffect(() => {
    return () => {
      shownReminderTags.clear();
    };
  }, []);
}

export const parseActivityStreamEvent = handleActivityReminderEvent;
