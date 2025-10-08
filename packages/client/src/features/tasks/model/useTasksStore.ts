import { create } from "zustand";
import type { Task } from "~/entities/Task";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

type TasksStore = {
  tasks: Map<string, Task> | undefined;
  setTasks: (tasks: Task[]) => void;
  updateTask: (task: Task) => void;
  createTask: (newTask: Omit<Task, "id">) => void;
  deleteTask: (taskId: Task["id"]) => void;
};

export const useTasksStore = create<TasksStore>()((set, get) => ({
  tasks: undefined,
  setTasks: (tasks) => {
    set({ tasks: new Map(tasks.map((task) => [task.id, task])) });
  },
  updateTask: (task) => {
    const currentTasks = get().tasks || new Map();

    if (currentTasks.has(task.id)) {
      const updatedTask = currentTasks.get(task.id);

      currentTasks.set(task.id, { ...updatedTask, ...task });
    }
  },
  createTask: (newTask) => {
    const currentTasks = get().tasks || new Map();
    const taskId = uuidv4();

    console.log("taskId", {
      id: taskId,
      ...newTask,
      createdAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    });

    currentTasks.set(taskId, {
      id: taskId,
      ...newTask,
      createdAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    });

    set({ tasks: currentTasks });
  },
  deleteTask: (taskId) => {
    const currentTasks = get().tasks || new Map();
    currentTasks.delete(taskId);

    set({ tasks: currentTasks });
  },
}));
