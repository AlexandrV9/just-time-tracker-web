import z from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(255),
  email: z
    .string()
    .trim()
    .max(255)
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "email is invalid",
    )
    .transform((value) => (value === "" ? null : value)),
});

export type UpdateProfileDataDTO = z.infer<typeof updateProfileSchema>;

export const profileUserSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  login: z.string(),
  email: z.string().nullable(),
  avatar: z.string().nullable(),
});

export type ProfileUserDTO = z.infer<typeof profileUserSchema>;
