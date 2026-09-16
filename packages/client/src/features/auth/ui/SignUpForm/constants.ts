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
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "acceptTerms.error.required",
    }),
    acceptPrivacy: z.boolean().refine((value) => value === true, {
      message: "acceptPrivacy.error.required",
    }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });
