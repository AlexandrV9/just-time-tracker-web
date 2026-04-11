// import type {
//   CreateTaskDataDTO,
//   DeleteTaskDataDTO,
//   UpdateTaskDataDTO,
// } from "~/shared/api/services/task/types";
// import type { BaseOperation, SyncEvents } from "../types";
// import { taskApiService } from "~/shared/api/services/task";
// import { EventBus } from "../../EventBus";

// export const syncEventBus = new EventBus<SyncEvents>();

// export abstract class OperationExecutor<
//   TOperation extends BaseOperation = BaseOperation
// > {
//   abstract execute(operation: TOperation): Promise<unknown>;
// }

// export class TaskOperationExecutor extends OperationExecutor<TaskOperation> {
//   async execute(operation: TaskOperation) {
//     console.log("Выполняем операцию");
//     switch (operation.type) {
//       case "CREATE":
//         return this.createTaskHandler(operation);
//       case "UPDATE":
//         return this.updateTaskHandler(operation);
//       case "DELETE":
//         return this.deleteTaskHandler(operation);
//       default:
//         throw new Error(`Unknown task operation: ${operation}`);
//     }
//   }

//   async createTaskHandler(operation: CreateTaskOperation): Promise<boolean> {
//     const localTask = await taskRepository.getTaskByLocalId(
//       operation.data.localId
//     );

//     if (!localTask) {
//       return false;
//     }

//     try {
//       await sleep();

//       const response = await taskApiService.createTask(operation.data);

//       if (!response.success) {
//         throw new Error();
//       }

//       await taskRepository.updateTask({
//         ...response.data,
//         syncStatus: "synced",
//       });

//       const test = await taskRepository.getTaskByLocalId(
//         operation.data.localId
//       );
//       console.log("test", test);

//       syncEventBus.emit("CREATE_TASK");

//       return true;
//     } catch {
//       await taskRepository.updateTask({
//         syncStatus: "error",
//         localId: localTask.localId,
//       });

//       syncEventBus.emit("CREATE_TASK");

//       return false;
//     }
//   }

//   async updateTaskHandler(operation: UpdateTaskOperation) {
//     console.log("Это операция обновления, вот ее данные", operation);

//     if (!operation.data.localId) {
//       return false;
//     }

//     const localTask = await taskRepository.getTaskByLocalId(
//       operation.data.localId
//     );

//     if (!localTask) {
//       return false;
//     }

//     try {
//       await sleep();
//       const response = await taskApiService.updateTask(operation.data);

//       if (!response.success) {
//         throw new Error();
//       }

//       await taskRepository.updateTask({
//         ...response.data,
//         syncStatus: "synced",
//       });

//       syncEventBus.emit("UPDATE_TASK");

//       return true;
//     } catch {
//       await taskRepository.updateTask({
//         syncStatus: "error",
//         localId: localTask.localId,
//       });

//       syncEventBus.emit("UPDATE_TASK");

//       return false;
//     }
//   }

//   async deleteTaskHandler(operation: DeleteTaskOperation) {
//     const localTask = await taskRepository.getTaskByLocalId(
//       operation.data.localId
//     );

//     if (!localTask) {
//       return false;
//     }

//     try {
//       await sleep();

//       const response = await taskApiService.deleteTask({
//         id: operation.data.id,
//       });

//       if (!response.success) {
//         throw new Error();
//       }

//       await taskRepository.deleteTask({
//         localId: operation.data.localId,
//       });

//       syncEventBus.emit("DELETE_TASK");

//       return true;
//     } catch {
//       await taskRepository.updateTask({
//         syncStatus: "error",
//         localId: operation.data.localId,
//         isDeleting: false,
//       });

//       syncEventBus.emit("DELETE_TASK");

//       return false;
//     }
//   }
// }

// const sleep = async (delayMs = 5000) => {
//   return new Promise((resolve) => setTimeout(resolve, delayMs));
// };

// export interface CreateTaskOperation extends BaseOperation<CreateTaskDataDTO> {
//   entity: "task";
//   type: "CREATE";
// }

// export interface UpdateTaskOperation extends BaseOperation<UpdateTaskDataDTO> {
//   entity: "task";
//   type: "UPDATE";
// }

// export interface DeleteTaskOperation extends BaseOperation<DeleteTaskDataDTO> {
//   entity: "task";
//   type: "DELETE";
// }

// export type TaskOperation =
//   | CreateTaskOperation
//   | UpdateTaskOperation
//   | DeleteTaskOperation;
