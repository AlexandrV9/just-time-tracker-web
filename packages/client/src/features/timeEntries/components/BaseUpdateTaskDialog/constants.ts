import type { TFunction } from "i18next";
import z from "zod";

export const timeSchema = z.object({
  hours: z.number(),
  minutes: z.number(),
  seconds: z.number(),
});

export const createUpdateTimeEntryFormSchema = (
  t: TFunction<"translation", undefined>,
) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(
        1,
        t(
          "features.timeEntries.baseUpdateTaskDialog.titleInput.error.required",
        ),
      )
      .max(80, {
        message: t(
          "features.timeEntries.baseUpdateTaskDialog.titleInput.error.max",
          { count: 80 },
        ),
      }),
    description: z
      .string()
      .trim()
      .max(200, {
        message: t(
          "features.timeEntries.baseUpdateTaskDialog.descriptionInput.error.max",
          { count: 200 },
        ),
      }),
    startTime: timeSchema,
    startDate: z.date(),
    endTime: timeSchema,
    endDate: z.date(),
  });

export type UpdateTimeEntryFormSchema = z.infer<
  ReturnType<typeof createUpdateTimeEntryFormSchema>
>;

export const formDefaultValues: UpdateTimeEntryFormSchema = {
  title: "",
  description: "",
  startDate: new Date(),
  startTime: { hours: 0, minutes: 0, seconds: 0 },
  endDate: new Date(),
  endTime: { hours: 0, minutes: 0, seconds: 0 },
};
