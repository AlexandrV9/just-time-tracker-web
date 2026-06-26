import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@time-tracker/shared";
import { activitySessionSegmentQueries } from "../../activity/activitySessionSegment.queries.js";
import { activitySettingsQueries } from "../../activity/activitySettings.queries.js";
import { notificationsRepository } from "./notifications.repository.js";
import { notificationsService } from "./notifications.service.js";
import {
  NOTIFICATION_JOB_TYPES,
  type NotificationJobType,
} from "./notifications.types.js";

const msFromSeconds = (seconds: number) => seconds * 1000;

const getUtcDayInterval = (): { fromDate: string; toDate: string } => {
  const now = new Date();
  const fromMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return {
    fromDate: new Date(fromMs).toISOString(),
    toDate: new Date(fromMs + 86_400_000).toISOString(),
  };
};

const sumActiveDurationMsInRange = (
  segments: Array<{
    type: ActivitySessionSegmentDTO["type"];
    startedAt: string;
    endedAt: string | null;
  }>,
  fromMs: number,
  toMs: number,
): number => {
  const nowMs = Date.now();
  let total = 0;

  for (const segment of segments) {
    if (segment.type !== "active") continue;

    const startMs = Date.parse(segment.startedAt);
    const endMs = segment.endedAt ? Date.parse(segment.endedAt) : nowMs;
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) continue;

    const clipStart = Math.max(startMs, fromMs);
    const clipEnd = Math.min(endMs, toMs);
    if (clipEnd > clipStart) {
      total += clipEnd - clipStart;
    }
  }

  return Math.max(0, Math.floor(total));
};

const getTodayActiveDurationSeconds = async (
  activityId: string,
): Promise<number> => {
  const { fromDate, toDate } = getUtcDayInterval();
  const fromMs = Date.parse(fromDate);
  const toMs = Date.parse(toDate);

  const segments =
    await activitySessionSegmentQueries.listSegmentIntervalsForActivityInRange(
      activityId,
      fromDate,
      toDate,
    );

  return Math.floor(
    sumActiveDurationMsInRange(segments, fromMs, toMs) / 1000,
  );
};

const isDailyGoalReached = async (
  activityId: string,
  goalSeconds: number,
): Promise<boolean> => {
  const todayActiveSeconds = await getTodayActiveDurationSeconds(activityId);
  if (todayActiveSeconds >= goalSeconds) {
    return true;
  }

  const { fromDate } = getUtcDayInterval();
  return notificationsRepository.hasSentGoalNotificationSince(
    activityId,
    fromDate,
  );
};

const getCurrentSegmentElapsedSeconds = (
  segment: ActivitySessionSegmentDTO | null | undefined,
  expectedType: ActivitySessionSegmentDTO["type"],
): number => {
  if (!segment || segment.type !== expectedType || segment.endedAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((Date.now() - new Date(segment.startedAt).getTime()) / 1000),
  );
};

const scheduleJob = async (input: {
  userId: string;
  activityId: string;
  sessionId: string;
  type: NotificationJobType;
  title: string;
  sendAt: Date;
}) => {
  const result = await notificationsService.scheduleNotification({
    userId: input.userId,
    activityId: input.activityId,
    type: input.type,
    title: input.title,
    body: "",
    sendAt: input.sendAt,
    payload: { sessionId: input.sessionId },
  });

  if (!result.success) {
    throw new Error(result.message ?? "Failed to schedule notification");
  }
};

const cancelSessionJobs = async (input: {
  activityId: string;
  sessionId: string;
  types?: NotificationJobType[];
}) => {
  const result = await notificationsService.cancelPendingJobs({
    activityId: input.activityId,
    sessionId: input.sessionId,
    types: input.types,
  });

  if (!result.success) {
    throw new Error(result.message ?? "Failed to cancel pending notifications");
  }
};

export const activityNotificationScheduler = {
  async onSessionActive(params: {
    activity: ActivityDTO;
    session: ActivitySessionDTO;
    segment?: ActivitySessionSegmentDTO | null;
  }) {
    const { activity, session, segment } = params;

    await cancelSessionJobs({
      activityId: activity.id,
      sessionId: session.id,
    });

    const settings = await activitySettingsQueries.getByActivityIdOrDefault(
      activity.id,
    );

    const todayActiveSeconds = await getTodayActiveDurationSeconds(activity.id);
    const now = Date.now();
    const base = {
      userId: activity.createdById,
      activityId: activity.id,
      sessionId: session.id,
      title: activity.title,
    };

    if (settings.notifyOnGoalReached) {
      const dailyGoalReached = await isDailyGoalReached(
        activity.id,
        settings.sessionGoalSeconds,
      );

      if (!dailyGoalReached) {
        const delaySeconds = Math.max(
          0,
          settings.sessionGoalSeconds - todayActiveSeconds,
        );

        await scheduleJob({
          ...base,
          type: NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED,
          sendAt: new Date(now + msFromSeconds(delaySeconds)),
        });
      }
    }

    if (settings.notifyOnLongActivity) {
      const activeSegmentSeconds = getCurrentSegmentElapsedSeconds(
        segment,
        "active",
      );
      const delaySeconds = Math.max(
        0,
        settings.longActivityThresholdSeconds - activeSegmentSeconds,
      );

      await scheduleJob({
        ...base,
        type: NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY,
        sendAt: new Date(now + msFromSeconds(delaySeconds)),
      });
    }
  },

  async onSessionPaused(params: {
    activity: ActivityDTO;
    session: ActivitySessionDTO;
    segment?: ActivitySessionSegmentDTO | null;
  }) {
    const { activity, session, segment } = params;

    await cancelSessionJobs({
      activityId: activity.id,
      sessionId: session.id,
      types: [
        NOTIFICATION_JOB_TYPES.ACTIVITY_GOAL_REACHED,
        NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_ACTIVITY,
      ],
    });

    const settings = await activitySettingsQueries.getByActivityIdOrDefault(
      activity.id,
    );

    if (!settings.notifyOnLongPause) {
      return;
    }

    const pauseSegmentSeconds = getCurrentSegmentElapsedSeconds(
      segment,
      "pause",
    );
    const delaySeconds = Math.max(
      0,
      settings.longPauseThresholdSeconds - pauseSegmentSeconds,
    );

    await scheduleJob({
      userId: activity.createdById,
      activityId: activity.id,
      sessionId: session.id,
      type: NOTIFICATION_JOB_TYPES.ACTIVITY_LONG_PAUSE,
      title: activity.title,
      sendAt: new Date(Date.now() + msFromSeconds(delaySeconds)),
    });
  },

  async onSessionFinished(params: {
    activity: ActivityDTO;
    session: ActivitySessionDTO;
  }) {
    await cancelSessionJobs({
      activityId: params.activity.id,
      sessionId: params.session.id,
    });
  },
};
