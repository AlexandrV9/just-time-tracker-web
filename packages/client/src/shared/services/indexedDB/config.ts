export const DB_CONFIG = {
  name: "task_tracker",
  version: 1,
  stores: {
    tasks: ["id", "title", "status", "startDate", "endDate"],
  },
} as const;

export type EntityType = "tasks";
// export type SyncOperation = "create" | "update" | "delete";
// export type SyncStatus = "pending" | "synced" | "error";
