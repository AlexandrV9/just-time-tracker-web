import { ConsoleNotificationSender } from "./consoleNotificationSender.js";
import type { NotificationSender } from "./notificationSender.interface.js";
import { notificationsRepository } from "./notifications.repository.js";

export const MAX_NOTIFICATION_DELIVERY_LAG_MS = 5_000;
const DEFAULT_BATCH_SIZE = 50;

export type NotificationWorkerOptions = {
  fallbackPollIntervalMs?: number;
  batchSize?: number;
  sender?: NotificationSender;
};

export type NotificationWorker = {
  start: () => void;
  stop: () => void;
  tick: () => Promise<void>;
  reschedule: () => Promise<void>;
};

export const createNotificationWorker = (
  options: NotificationWorkerOptions = {},
): NotificationWorker => {
  const fallbackPollIntervalMs =
    options.fallbackPollIntervalMs ?? MAX_NOTIFICATION_DELIVERY_LAG_MS;
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const sender = options.sender ?? new ConsoleNotificationSender();

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let wakeTimer: ReturnType<typeof setTimeout> | null = null;
  let isTicking = false;

  const scheduleNextWake = async () => {
    if (wakeTimer) {
      clearTimeout(wakeTimer);
      wakeTimer = null;
    }

    const nextSendAt = await notificationsRepository.findNextPendingSendAt();
    if (!nextSendAt) {
      return;
    }

    const delay = Math.max(0, new Date(nextSendAt).getTime() - Date.now());

    wakeTimer = setTimeout(() => {
      void tick().then(scheduleNextWake);
    }, delay);
  };

  const tick = async () => {
    if (isTicking) {
      return;
    }

    isTicking = true;

    try {
      const jobs = await notificationsRepository.findDuePendingJobs(batchSize);

      for (const job of jobs) {
        try {
          await sender.send(job);
          await notificationsRepository.markAsSent(job.id);
        } catch (error) {
          console.error(
            `Notification worker failed to send job ${job.id}:`,
            error,
          );
          await notificationsRepository.markAsFailed(job.id);
        }
      }
    } catch (error) {
      console.error("Notification worker tick error:", error);
    } finally {
      isTicking = false;
      await scheduleNextWake();
    }
  };

  const start = () => {
    if (pollTimer) {
      return;
    }

    void tick();

    pollTimer = setInterval(() => {
      void tick();
    }, fallbackPollIntervalMs);
  };

  const stop = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }

    if (wakeTimer) {
      clearTimeout(wakeTimer);
      wakeTimer = null;
    }
  };

  return {
    start,
    stop,
    tick,
    reschedule: scheduleNextWake,
  };
};
