export const OperationType = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export const SyncStatus = {
  pending: "pending",
  syncing: "syncing",
  synced: "synced",
  failed: "failed",
  conflict: "conflict",
} as const;

export const EntityType = {
  task: "task",
} as const;

export const OperationPriority = {
  high: 100, // Критичные операции (удаление, срочные изменения)
  medium: 50, // // Обычные изменения
  low: 10, // Фоновые операции
  background: 1, // Не срочные операции
} as const;

export const getOperationPriorityKeyByValue = (
  value: (typeof OperationPriority)[keyof typeof OperationPriority]
): keyof typeof OperationPriority => {
  const priority =
    Object.entries(OperationPriority).find(([, v]) => v === value)?.[0] ||
    "medium";

  return priority as keyof typeof OperationPriority;
};
