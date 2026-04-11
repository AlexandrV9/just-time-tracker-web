// import { SyncQueue } from "./SyncQueue";
// // import { TaskOperationExecutor, type TaskOperation } from "./OperationExecutor";
// import { EventBus } from "../EventBus";
// import { NetworkMonitor, type NetworkEvents } from "./NetworkMonitor";
// // import { OperationRepository } from "./OperationRepository";
// // import { OperationFactory, type OperationData } from "./OperationFactory";
// // import type { Task } from "~/shared/api/services/task";

// // const networkEventBus = new EventBus<NetworkEvents>();
// // const networkMonitor = new NetworkMonitor({ eventBus: networkEventBus });

// export class SyncManager {
//   //   private conflictResolver: ConflictResolver;
//   //   private networkMonitor: NetworkMonitor;
//   //   private retryStrategy: RetryStrategy;
//   //   private syncStrategy: SyncStrategy;
//   //   private operationFactory: OperationFactory;

//   // КлассКоторыйЗнаетКакОбрабатыватьОперации
//   // Нужен класс который умеет обрабатывать операции (по типу действия + типу сущности вызывать нужные ручки)

//   // private syncQueue: SyncQueue<TaskOperation>;
//   // private eventBus: EventBus<SyncEvents>;
//   // private operationExecutor: TaskOperationExecutor;
//   // private operationRepository: OperationRepository<TaskOperation>;
//   private operationFactory: OperationFactory<Task>;
//   private unsubscribeNetwork?: () => void;

//   // Сервисы
//   //   private localDB: LocalDatabase;
//   //   private api: ApiService;
//   //   private eventBus: EventBus;

//   private isInitialized = false;
//   private isSyncing = false;
//   //   private syncInterval: NodeJS.Timeout | null = null;

//   constructor() {
//     // this.initComponents();
//     // this.startBackgroundSync();
//     // this.syncQueue = new SyncQueue();
//     // this.eventBus = new EventBus();
//     // this.operationExecutor = new TaskOperationExecutor();
//     // this.operationRepository = new OperationRepository();
//     this.operationFactory = new OperationFactory();
//   }

//   async init(): Promise<void> {
//     if (this.isInitialized) {
//       console.warn("SyncManager already initialized");
//       return;
//     }

//     try {
//       // const operations = await this.operationRepository.getAll();

//       // if (operations.length > 0) {
//       //   console.log("У нас есть сохраненные операции", operations);
//       //   console.log("Кладем их в очередь");
//       //   await this.syncQueue.setOperations(operations);
//       //   this.processQueue();
//       // }

//       // this.setupNetworkListeners();

//       // console.log("✅ SyncManager initialized");
//     } catch (error) {
//       console.error("Failed to initialize SyncManager:", error);
//     }
//   }

//   // private setupNetworkListeners(): void {
//   //   // Подписываемся на появление сети
//   //   this.unsubscribeNetwork = networkMonitor.onOnline(() => {
//   //     console.log("🌐 Network online - starting sync");
//   //     this.sync().catch(console.error);
//   //   });
//   // }

//   /**
//    * Запуск фоновой синхронизации
//    */
//   // private startBackgroundSync(): void {
//   //   // Синхронизация каждые 30 секунд когда онлайн
//   //   setInterval(() => {
//   //     if (this.networkMonitor.isOnline) {
//   //       this.processQueue().catch(console.error);
//   //     }
//   //   }, 30000);
//   // }

//   // async createOperation(operationData: OperationData<Task>) {
//   //   try {
//   //     let operation: TaskOperation;

//   //     switch (operationData.type) {
//   //       case "CREATE":
//   //         operation =
//   //           this.operationFactory.createCreateOperation(operationData);
//   //         break;
//   //       case "UPDATE":
//   //         operation =
//   //           this.operationFactory.createUpdateOperation(operationData);
//   //         break;
//   //       case "DELETE":
//   //         operation =
//   //           this.operationFactory.createDeleteOperation(operationData);
//   //         break;
//   //       default:
//   //         throw new Error(`Unknown operation type: ${operationData}`);
//   //     }

//   //     const newOperation = await this.operationRepository.create(operation);

//   //     if (!newOperation) {
//   //       throw new Error("this.operationRepository.create");
//   //     }

//   //     console.log(`📝 Created ${operation.type} operation for task`);

//   //     this.syncQueue.addOperation(newOperation);

//   //     if (networkMonitor.isOnline) {
//   //       this.processQueue();
//   //     }
//   //   } catch (error) {
//   //     console.error("❌ Failed to create operation:", error);
//   //     throw error;
//   //   }
//   // }

//   /**
//    * Публичный метод для принудительной синхронизации
//    */
//   // async sync(): Promise<void> {
//   //   await this.processQueue();
//   // }

//   // Основной цикл синхронизации
//   // private async processQueue(): Promise<void> {
//   //   const isOnline = networkMonitor.isOnline;
//   //   const hasOperations = this.syncQueue.hasOperations();

//   //   if (this.isSyncing || !hasOperations) {
//   //     console.log(
//   //       `🔄 Sync skipped: syncing=${this.isSyncing}, online=${isOnline}, hasOps=${hasOperations}`
//   //     );

//   //     return;
//   //   }

//   //   this.isSyncing = true;
//   //   console.log("🔄 Starting sync process...");

//   //   try {
//   //     while (this.syncQueue.hasOperations() && networkMonitor.isOnline) {
//   //       const operation = this.syncQueue.getNextOperation();

//   //       console.log("Сейчас будем выполнять эту операцию", operation);

//   //       if (operation) {
//   //         const success = await this.executeOperation(operation);

//   //         if (success) {
//   //           await this.operationRepository.deleteByLocalId(operation.localId);

//   //           this.syncQueue.deleteOperationById(operation.localId);

//   //           console.log(`✅ Successfully synced ${operation.type} operation`);
//   //         } else {
//   //           console.warn(
//   //             `⚠️ Failed to sync ${operation.type} operation, will retry`
//   //           );
//   //         }
//   //       }
//   //     }
//   //   } finally {
//   //     this.isSyncing = false;
//   //     console.log("🔄 Sync process completed");
//   //   }
//   // }

//   /**
//    * Получает статус синхронизации
//    */
//   // getSyncStatus() {
//   //   return {
//   //     isOnline: networkMonitor.isOnline,
//   //     isSyncing: this.isSyncing,
//   //     pendingOperations: this.syncQueue.getSize(),
//   //     isInitialized: this.isInitialized,
//   //   };
//   // }

//   /**
//    * Очистка ресурсов
//    */
//   async destroy(): Promise<void> {
//     this.unsubscribeNetwork?.();

//     this.isInitialized = false;
//     console.log("🛑 SyncManager destroyed");
//   }

//   /**
//    * Выполнение операции синхронизации
//    */
//   // private async executeOperation(operation: TaskOperation): Promise<boolean> {
//   //   return this.operationExecutor.execute(operation);
//   // }

//   // private async handleSuccess(
//   //   operation: TaskOperation,
//   //   result: RequestResponse<TaskDTO, unknown>
//   // ): Promise<void> {
//   //   // // Обновляем локальную БД
//   //   // await this.localDB.markAsSynced(operation.localId, result);

//   //   switch (operation.type) {
//   //     case "CREATE":
//   //       this.break;
//   //     case "UPDATE":
//   //       this.eventBus.emit("UPDATE_TASK", { operation, responseData: result });
//   //       break;
//   //     case "DELETE":
//   //       this.eventBus.emit("UPDATE_TASK", { operation, responseData: result });
//   //       break;
//   //   }

//   //   // // Отправляем событие об успехе
//   //   this.eventBus.emit("SYNC_SUCCESS", { operation, result });

//   //   this.syncQueue.removeOperationById(operation.id);
//   // }

//   // private async handleError(
//   //   operation: TaskOperation,
//   //   error: any
//   // ): Promise<void> {
//   //   this.eventBus.emit("SYNC_ERROR", {
//   //     operation,
//   //     error: undefined,
//   //   });
//   // if (error.isConflict) {
//   //   // Конфликт - просим пользователя решить
//   //   const resolution = await this.conflictResolver.resolve({
//   //     operation,
//   //     error,
//   //     localData: await this.localDB.get(operation.localId),
//   //     serverData: error.serverData,
//   //   });
//   //   await this.applyResolution(resolution);
//   // } else {
//   //   // Техническая ошибка - оставляем в очереди для retry
//   //   operation.retryCount = (operation.retryCount || 0) + 1;
//   //   operation.lastError = error.message;
//   //   if (operation.retryCount >= this.retryStrategy.maxAttempts) {
//   //     await this.localDB.markAsFailed(operation.localId, error);
//   //     this.queue.remove(operation.id);
//   //   }
//   // }
//   // }
// }

// export const taskSyncManager = new SyncManager();
