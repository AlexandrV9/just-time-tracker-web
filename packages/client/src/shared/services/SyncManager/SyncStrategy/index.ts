// // 5. SyncStrategy (Стратегия синхронизации)

// class SyncStrategy {
//   // Когда синхронизировать?
//   shouldSyncImmediately(operation: SyncOperation): boolean;
//   shouldSyncInBackground(): boolean;
  
//   // Что синхронизировать первым?
//   getSyncPriority(operation: SyncOperation): number;
  
//   // Батчинг операций
//   groupOperations(operations: SyncOperation[]): SyncBatch[];
// }