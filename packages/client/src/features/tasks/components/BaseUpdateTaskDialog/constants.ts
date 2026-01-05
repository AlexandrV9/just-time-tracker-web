import z from "zod";

export const timeSchema = z.object({
  hours: z.number(),
  minutes: z.number(),
  seconds: z.number(),
});

export const updateTaskFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  startTime: timeSchema,
  startDate: z.date(),
  endTime: timeSchema,
  endDate: z.date(),
});

type UpdateTaskFormSchema = z.infer<typeof updateTaskFormSchema>;

export const formDefaultValues: UpdateTaskFormSchema = {
  title: "",
  description: "",
  startDate: new Date(),
  startTime: { hours: 0, minutes: 0, seconds: 0 },
  endDate: new Date(),
  endTime: { hours: 0, minutes: 0, seconds: 0 },
};
