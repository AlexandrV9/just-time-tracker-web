import { Hono } from "hono";
import { tasksHandlers } from "./task.handlers.js";

export const tasksRouter = new Hono();

tasksRouter.get("/", tasksHandlers.getTasks);
tasksRouter.post("/", tasksHandlers.createTask);
tasksRouter.patch("/", tasksHandlers.updateTask);
tasksRouter.delete("/:id", tasksHandlers.deleteTask);
tasksRouter.get("/:id", tasksHandlers.getTaskById);
