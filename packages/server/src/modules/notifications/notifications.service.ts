import type { ErrorResponse, SuccessResponse } from "../../shared/types.js";
import { notificationsRepository } from "./notifications.repository.js";
import type {
  CancelPendingJobsInput,
  NotificationJob,
  ScheduleNotificationInput,
} from "./notifications.types.js";

type ScheduleNotificationResponse =
  | SuccessResponse<NotificationJob>
  | ErrorResponse;

type CancelNotificationResponse =
  | SuccessResponse<NotificationJob>
  | ErrorResponse;

type CancelPendingJobsResponse =
  | SuccessResponse<{ count: number }>
  | ErrorResponse;

let jobsChangeListener: (() => void) | null = null;

export const setNotificationJobsChangeListener = (listener: () => void) => {
  jobsChangeListener = listener;
};

const notifyJobsChanged = () => {
  jobsChangeListener?.();
};

const scheduleNotification = async (
  input: ScheduleNotificationInput,
): Promise<ScheduleNotificationResponse> => {
  try {
    const job = await notificationsRepository.createJob(input);
    notifyJobsChanged();

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    console.error("Schedule notification error:", error);

    return {
      success: false,
      message: "Failed to schedule notification",
    };
  }
};

const cancelNotification = async (input: {
  jobId: string;
}): Promise<CancelNotificationResponse> => {
  try {
    const existing = await notificationsRepository.findById(input.jobId);

    if (!existing) {
      return {
        success: false,
        message: "Notification job not found",
      };
    }

    if (existing.status !== "pending") {
      return {
        success: false,
        message: "Only pending notifications can be canceled",
      };
    }

    const job = await notificationsRepository.markAsCanceled(input.jobId);

    if (!job) {
      return {
        success: false,
        message: "Failed to cancel notification",
      };
    }

    notifyJobsChanged();

    return {
      success: true,
      data: job,
    };
  } catch (error) {
    console.error("Cancel notification error:", error);

    return {
      success: false,
      message: "Failed to cancel notification",
    };
  }
};

const cancelPendingJobs = async (
  input: CancelPendingJobsInput,
): Promise<CancelPendingJobsResponse> => {
  try {
    const count = await notificationsRepository.cancelPendingJobs(input);
    notifyJobsChanged();

    return {
      success: true,
      data: { count },
    };
  } catch (error) {
    console.error("Cancel pending notifications error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel pending notifications",
    };
  }
};

export const notificationsService = {
  scheduleNotification,
  cancelNotification,
  cancelPendingJobs,
};
