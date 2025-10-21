import z from "zod";

export const signInSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export type SignInData = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  firstName: z.string().min(1),
  login: z.string().min(1),
  password: z.string().min(1),
});

export type SignUpData = z.infer<typeof signUpSchema>;
