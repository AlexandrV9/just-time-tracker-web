import type { TaskDTO } from "@to-do-list/shared";
import { mockTasks } from "~/entities/Task/mocks";

export const priorityTasksMock: TaskDTO[] = mockTasks.filter(
  (item) => item.priority === "high"
);
