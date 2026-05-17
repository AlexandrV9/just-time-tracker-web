import {
  EntityType,
  OperationPriority,
  OperationType,
  SyncStatus,
} from "./constants";

export type OperationType = keyof typeof OperationType;

export type OperationSyncStatusType = keyof typeof SyncStatus;

export type OperationPriorityType = keyof typeof OperationPriority;

export type OperationEntityType = keyof typeof EntityType;

export type OperationPriorityValueType =
  (typeof OperationPriority)[keyof typeof OperationPriority];

export interface BaseOperation<TData = unknown> {
  /**
   * Идентификатор операции
   * На клиенте он будет всегда null
   * Если мы захотим сохранять операции на сервере,
   * то этот id как раз будет нужен для сервера
   */
  id: string | null;
  /**
   * Идентификатор операции в локальном хранилище localId = id
   */
  localId: string;
  /**
   * Тип операции
   */
  type: OperationType;
  /**
   * Приоритет операции
   */
  priority: OperationPriorityType;
  /**
   * Тип сущности операции
   */
  entity: OperationEntityType;
  /**
   * Полезные данные
   */
  data: TData;
  /**
   * Время создания операции
   */
  createdAt: string;
  /**
   * Время обновления операции
   */
  updatedAt: string;
  /**
   * Cтатус операции
   */
  syncStatus: OperationSyncStatusType;

  // ********************************************************

  // retryCount?: number;
  // lastError?: string;
  //   metadata?: {
  //     source: "user" | "sync" | "system";
  //     userId?: string;
  //     deviceId?: string;
  //   };
}

export interface SyncEvents {
  // События синхронизации
  SYNC_SUCCESS: { operation: BaseOperation; result: unknown };
  SYNC_ERROR: { operation: BaseOperation; error?: Error };

  // Общие события
  SYNC_STARTED: void;
  SYNC_COMPLETED: void;

  // События по сущностям
  CREATE_TASK: { operation: BaseOperation; responseData: unknown };
  UPDATE_TASK: { operation: BaseOperation; responseData: unknown };
  DELETE_TASK: { operation: BaseOperation; responseData: boolean };
}

export type SyncEventType = keyof SyncEvents;

export type SyncEventPayload<T extends SyncEventType> = SyncEvents[T];
