import type {
  TimeEntryDTO,
  TagDTO,
  CreateTimeEntryDataDTO,
  UpdateTimeEntryDataDTO,
  DeleteTimeEntryDataDTO,
} from "@to-do-list/shared";
import { timeEntryQueries } from "./timeEntry.queries.js";

const getTimeEntryById = async (id: string): Promise<TimeEntryDTO | null> => {
  const entry = await timeEntryQueries.getTimeEntryById(id);
  if (!entry) return null;
  return mapDbEntryToDTO(entry);
};

const createTimeEntry = async (
  data: CreateTimeEntryDataDTO
): Promise<TimeEntryDTO> => {
  const entry = await timeEntryQueries.createTimeEntry(data);
  return mapDbEntryToDTO(entry);
};

const updateTimeEntry = async (
  data: UpdateTimeEntryDataDTO
): Promise<TimeEntryDTO> => {
  const entry = await timeEntryQueries.updateTimeEntry(data);
  return mapDbEntryToDTO(entry);
};

const deleteTimeEntry = async (
  data: DeleteTimeEntryDataDTO
): Promise<boolean> => {
  try {
    return await timeEntryQueries.deleteTimeEntry(data.id);
  } catch {
    return false;
  }
};

const mapDbEntryToDTO = (entry: any): TimeEntryDTO => {
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description ?? undefined,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    createdById: entry.createdById,
    tags: mapTags(entry.tags),
  } as TimeEntryDTO;
};

const mapTags = (tags?: string[] | null): TagDTO[] =>
  tags?.map((tag) => ({
    id: tag,
    title: tag,
    label: tag,
  })) ?? [];

export const timeEntryRepository = {
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
};
