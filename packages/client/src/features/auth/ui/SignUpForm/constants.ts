import {
  loginSchema,
  maxLengthPassword,
  minLengthPassword,
  passwordSchema,
} from "@time-tracker/shared";
import z from "zod";

export { maxLengthPassword, minLengthPassword };

export const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, "firstName.error.required"),
    login: loginSchema,
    password: passwordSchema,
    repeatPassword: z.string().min(1, "repeatPassword.error.required"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });
