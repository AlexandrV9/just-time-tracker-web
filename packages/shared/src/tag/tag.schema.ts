import z from "zod";

export const tagSchema = z.object({
  id: z.string(),
  title: z.string(),
  label: z.string(),
});

export type TagDTO = z.infer<typeof tagSchema>;

export const tagIdSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export type TagIdDTO = z.infer<typeof tagIdSchema>;
export type GetTagDataDTO = TagIdDTO;
export type DeleteTagDataDTO = TagIdDTO;
