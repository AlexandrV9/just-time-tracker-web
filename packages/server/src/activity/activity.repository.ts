import type {
  ActivityDTO,
  CreateActivityDataDTO,
  UpdateActivityDataDTO,
  DeleteActivityDataDTO,
} from "@to-do-list/shared";
import { DuplicateActivityTitleError } from "./activity.errors.js";
import { activityQueries } from "./activity.queries.js";

const getActivityById = async (id: string): Promise<ActivityDTO | null> => {
  const entry = await activityQueries.getActivityById(id);
  if (!entry) return null;
  return mapDbEntryToDTO(entry);
};

const createActivity = async (
  data: CreateActivityDataDTO,
): Promise<ActivityDTO> => {
  const title = await activityQueries.resolveUniqueTitleForUser(
    data.createdById,
    data.title,
  );
  const entry = await activityQueries.createActivity({ ...data, title });
  return mapDbEntryToDTO(entry);
};

const updateActivity = async (
  data: UpdateActivityDataDTO,
): Promise<ActivityDTO | null> => {
  const existing = await activityQueries.getActivityById(data.id);
  if (!existing) {
    return null;
  }

  let payload: UpdateActivityDataDTO = { ...data };

  if (data.title !== undefined) {
    const trimmed = data.title.trim();
    const taken = await activityQueries.titleExistsForUser(
      String(existing.createdById),
      trimmed,
      data.id,
    );
    if (taken) {
      throw new DuplicateActivityTitleError();
    }
    payload = { ...payload, title: trimmed };
  }

  const entry = await activityQueries.updateActivity(payload);
  if (!entry) {
    return null;
  }
  return mapDbEntryToDTO(entry);
};

const deleteActivity = async (
  data: DeleteActivityDataDTO,
): Promise<boolean> => {
  try {
    return await activityQueries.deleteActivity(data.id);
  } catch {
    return false;
  }
};

const mapDbEntryToDTO = (entry: Record<string, unknown>): ActivityDTO => {
  return {
    id: String(entry.id),
    title: String(entry.title),
    description:
      entry.description === null || entry.description === undefined
        ? undefined
        : String(entry.description),
    createdAt: String(entry.createdAt),
    updatedAt: String(entry.updatedAt),
    createdById: String(entry.createdById),
    tags: Array.isArray(entry.tags)
      ? (entry.tags as unknown[]).map(String)
      : [],
    lastActivitySessionId:
      entry.lastActivitySessionId === null ||
      entry.lastActivitySessionId === undefined
        ? null
        : String(entry.lastActivitySessionId),
    activeDurationMs: Number(entry.activeDurationMs ?? 0),
    pauseDurationMs: Number(entry.pauseDurationMs ?? 0),
  };
};

export const activityRepository = {
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};
