import { Hono } from "hono";
import { timeEntryHandlers } from "./timeEntry.handlers.js";

export const timeEntriesRouter = new Hono();

timeEntriesRouter.get("/", timeEntryHandlers.getTimeEntries);
timeEntriesRouter.post("/", timeEntryHandlers.createTimeEntry);
timeEntriesRouter.patch("/", timeEntryHandlers.updateTimeEntry);

timeEntriesRouter.get("/:id", timeEntryHandlers.getTimeEntryById);
timeEntriesRouter.delete("/:id", timeEntryHandlers.deleteTimeEntry);
