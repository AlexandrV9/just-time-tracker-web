import type { BaseOperation } from "../SyncManager/types";

const operationTableColumns: (keyof BaseOperation)[] = [
  "id",
  "localId",
  "type",
  "priority",
  "entity",
  "entityId",
  "data",
  "createdAt",
  "updatedAt",
  "syncStatus",
];

export const DB_CONFIG = {
  name: "task_tracker",
  version: 2,
  stores: {
    tasks: [
      "id",
      "localId",
      "title",
      "description",
      "status",
      "priority",
      "createdAt",
      "updatedAt",
      "startDate",
      "endDate",
      "actualStartDate",
      "actualEndDate",
      "createdById",
      "tags",
      "isDeleting",
      "syncStatus",
    ],
    operations: operationTableColumns,
  },
} as const;

export type EntityType = "tasks";

export type EntitySyncStatus = "pending" | "synced" | "error";
