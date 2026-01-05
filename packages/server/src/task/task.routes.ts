import { Hono } from "hono";
import { tasksHandlers } from "./task.handlers.js";

export const tasksRouter = new Hono();

tasksRouter.get("/", tasksHandlers.getTasks);
tasksRouter.get("/count", tasksHandlers.getTasksCount);
tasksRouter.post("/", tasksHandlers.createTask);
tasksRouter.patch("/", tasksHandlers.updateTask);
tasksRouter.post("/free-slots", tasksHandlers.getFreeSlots);
tasksRouter.get("/:id", tasksHandlers.getTaskById);
tasksRouter.delete("/:id", tasksHandlers.deleteTask);
