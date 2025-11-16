import { IndexedDB } from "~/shared/services/IndexedDB";
import type {
  LocalCreateTaskData,
  LocalDeleteTaskData,
  LocalUpdateTaskData,
} from "./types";
import type { Task } from "~/shared/api/services/task";

export class TaskRepository {
  private tableName = "tasks";
  private localDatabase: IndexedDB<Task>;

  constructor() {
    this.localDatabase = new IndexedDB<Task>({ tableName: "tasks" });
  }

  getTaskByLocalId = (taskId: Task["localId"]) => {
    return this.localDatabase.getByLocalId(taskId);
  };

  async getAllTasks(): Promise<Task[]> {
    return this.localDatabase.getAll();
  }

  async createTask(taskData: LocalCreateTaskData) {
    return this.localDatabase.create({
      ...taskData,
      syncStatus: "pending",
    });
  }

  async updateTask(taskData: LocalUpdateTaskData): Promise<Task | null> {
    return this.localDatabase.update(taskData);
  }

  async deleteTask(taskData: LocalDeleteTaskData): Promise<boolean> {
    return this.localDatabase.deleteByLocalId(taskData.localId);
  }

  async getTasksByStatus(status: Task["status"]): Promise<Task[]> {
    const db = await this.localDatabase.getDatabaseInstance();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.tableName], "readonly");
      const store = transaction.objectStore(this.tableName);
      const index = store.index("status");
      const request = index.getAll(status);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const taskRepository = new TaskRepository();
