import {
  NOTIFICATION_JOB_TYPES,
  type NotificationJobTypeDTO,
} from "../activity/activityEvents.schema.js";

export const SUPPORTED_LOCALES = ["en", "ru", "zh"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type ReminderCopy = {
  title: string;
  body: string;
};

const REMINDER_COPY: Record<
  SupportedLocale,
  Record<NotificationJobTypeDTO, { title: string; body: string }>
> = {
  en: {
    [NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED]: {
      title: "🎉 Goal reached",
      body: 'Great work! You\'ve reached the session goal for "{{activityTitle}}".',
    },
    [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_PAUSE]: {
      title: "⏸️ Long pause",
      body: 'The pause for "{{activityTitle}}" has gone on for a while. Ready to continue?',
    },
    [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY]: {
      title: "⏱️ Check the timer",
      body: '"{{activityTitle}}" has been running for a long time. Still working on it?',
    },
  },
  ru: {
    [NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED]: {
      title: "🎉 Цель достигнута",
      body: "Отличная работа! Вы достигли цели сессии «{{activityTitle}}».",
    },
    [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_PAUSE]: {
      title: "⏸️ Долгая пауза",
      body: "Пауза по «{{activityTitle}}» затянулась. Готовы продолжить?",
    },
    [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY]: {
      title: "⏱️ Проверьте таймер",
      body: "«{{activityTitle}}» длится уже долго. Всё ещё работаете над ней?",
    },
  },
  zh: {
    [NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED]: {
      title: "🎉 目标已达成",
      body: "做得好！你已完成「{{activityTitle}}」的会话目标。",
    },
    [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_PAUSE]: {
      title: "⏸️ 暂停时间较长",
      body: "「{{activityTitle}}」的暂停有点久了。准备好继续了吗？",
    },
    [NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY]: {
      title: "⏱️ 请查看计时器",
      body: "「{{activityTitle}}」已经持续很久了。还在进行中吗？",
    },
  },
};

const normalizeLocale = (locale: string): SupportedLocale => {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return SUPPORTED_LOCALES.includes(base as SupportedLocale)
    ? (base as SupportedLocale)
    : "en";
};

const interpolateActivityTitle = (
  template: string,
  activityTitle: string,
): string => template.replace(/\{\{activityTitle\}\}/g, activityTitle);

export const getReminderCopy = (
  locale: string,
  reminderType: NotificationJobTypeDTO,
  activityTitle: string,
): ReminderCopy => {
  const normalizedLocale = normalizeLocale(locale);
  const copy = REMINDER_COPY[normalizedLocale][reminderType];

  return {
    title: copy.title,
    body: interpolateActivityTitle(copy.body, activityTitle),
  };
};
