import { useEffect } from "react";
import { syncEventBus } from "~/shared/services/SyncManager/OperationExecutor";
import type { SyncEvents } from "~/shared/services/SyncManager/types";

interface UseTaskEventsProps {
  onTaskCreated?: (payload: SyncEvents["CREATE_TASK"]) => void;
  onTaskUpdated?: (payload: SyncEvents["UPDATE_TASK"]) => void;
  onTaskDeleted?: (payload: SyncEvents["DELETE_TASK"]) => void;
  onSyncSuccess?: (payload: SyncEvents["SYNC_SUCCESS"]) => void;
  onSyncError?: (payload: SyncEvents["SYNC_ERROR"]) => void;
}

export const useTaskEvents = (callbacks: UseTaskEventsProps) => {
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onTaskCreated) {
      unsubscribers.push(
        syncEventBus.on("CREATE_TASK", callbacks.onTaskCreated)
      );
    }

    if (callbacks.onTaskUpdated) {
      unsubscribers.push(
        syncEventBus.on("UPDATE_TASK", callbacks.onTaskUpdated)
      );
    }

    if (callbacks.onTaskDeleted) {
      unsubscribers.push(
        syncEventBus.on("DELETE_TASK", callbacks.onTaskDeleted)
      );
    }

    if (callbacks.onSyncSuccess) {
      unsubscribers.push(
        syncEventBus.on("SYNC_SUCCESS", callbacks.onSyncSuccess)
      );
    }

    if (callbacks.onSyncError) {
      unsubscribers.push(syncEventBus.on("SYNC_ERROR", callbacks.onSyncError));
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    callbacks.onTaskCreated,
    callbacks.onTaskUpdated,
    callbacks.onTaskDeleted,
    callbacks.onSyncSuccess,
    callbacks.onSyncError,
  ]);
};
