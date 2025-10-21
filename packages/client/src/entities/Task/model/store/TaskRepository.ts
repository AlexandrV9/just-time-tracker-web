import { BaseRepository } from "~/shared/services";
import type { Task } from "../../types";
// import { v4 as uuidv4 } from "uuid";

import type { CreateTaskData, UpdateTaskData } from "./types";

class TaskRepository extends BaseRepository<Task> {
  protected storeName = "tasks" as const;

  async create(taskData: CreateTaskData): Promise<Task> {
    const task: Omit<Task, "id"> = {
      ...taskData,
      // id: uuidv4(),
      //   syncStatus: "pending" as SyncStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "todo",
      priority: "low",
      createdById: "test_createdById",
    };

    const id = await this.executeTransaction<number>(
      this.storeName,
      "readwrite",
      (store) => store.add(task)
    );

    // Добавляем в очередь синхронизации
    // await this.addToSyncQueue("tasks", "create", { ...task, id });

    return { ...task, id: id.toString() };
  }

  async update(data: UpdateTaskData): Promise<Task> {
    console.log("data.id", data.id);
    const task = await this.getById(data.id);

    if (!task) {
      throw new Error("Task not found");
    }

    const updatedTask: Task = {
      ...task,
      ...data,
      updatedAt: new Date().toISOString(),
      // syncStatus: "pending" as SyncStatus,
    };

    await this.executeTransaction(this.storeName, "readwrite", (store) =>
      store.put(updatedTask)
    );

    // await this.addToSyncQueue("tasks", "update", updatedTask);

    return updatedTask;
  }

  async delete(id: string): Promise<void> {
    const task = await this.getById(id);

    if (!task) {
      throw new Error("Task not found");
    }

    await this.executeTransaction(this.storeName, "readwrite", (store) =>
      store.delete(id)
    );

    // await this.addToSyncQueue("tasks", "delete", { id });
  }

  async getById(id: string): Promise<Task | null> {
    return this.executeTransaction<Task | null>(
      this.storeName,
      "readonly",
      (store) => store.get(id)
    );
  }

  async getAll(): Promise<Task[]> {
    return this.executeTransaction<Task[]>(
      this.storeName,
      "readonly",
      (store) => store.getAll()
    );
  }

  async getByStatus(status: string): Promise<Task[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("status");
      const request = index.getAll(status);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // private async addToSyncQueue(
  //   entityType: string,
  //   operation: string,
  //   data: any
  // ): Promise<void> {
  //   const syncItem = {
  //     entityType,
  //     operation,
  //     data,
  //     createdAt: new Date().toISOString(),
  //     retryCount: 0,
  //   };

  //   await this.executeTransaction("syncQueue", "readwrite", (store) =>
  //     store.add(syncItem)
  //   );
  // }
}

export const taskRepository = new TaskRepository();
