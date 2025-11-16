// // Обертка над IndexedDB для синхронизации
// class LocalDatabase {
//   async saveWithSyncStatus(data: any, status: SyncStatus): Promise<void>;
//   async getPendingSyncItems(): Promise<any[]>;
//   async markAsSynced(localId: string, serverData: any): Promise<void>;
// }