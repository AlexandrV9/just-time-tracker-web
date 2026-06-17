import { loginSchema, passwordSchema } from "@to-do-list/shared";
import z from "zod";

export const signInSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export type SignInData = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1),
  login: loginSchema,
  password: passwordSchema,
});

export type SignUpData = z.infer<typeof signUpSchema>;
