import z from "zod";

export const minLengthPassword = 8;

export const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, "firstName.error.required"),
    login: z.string().min(1, "login.error.required"),
    password: z.string().min(minLengthPassword, "password.error.minLength"),
    repeatPassword: z.string().min(1, "repeatPassword.error.required"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });
