import z from "zod";

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const baseIdSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const paginationResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema),
    pagination: paginationSchema,
  });

export type BaseIdDTO = z.infer<typeof baseIdSchema>;
export type PaginationDTO = z.infer<typeof paginationSchema>;

export interface PaginationResponseDTO<T> {
  data: T[];
  pagination: PaginationDTO;
}

export type TimeSlotDTO = {
  startDate: string;
  endDate: string;
};
