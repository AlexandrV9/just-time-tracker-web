import { passwordSchema } from "@to-do-list/shared";
import z from "zod";

export const setPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    repeatPassword: z.string().min(1, "repeatPassword.error.required"),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });

export const updatePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "currentPassword.error.required"),
    newPassword: passwordSchema,
    repeatPassword: z.string().min(1, "repeatPassword.error.required"),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });

export const updatePasswordDialogLocale = "features.updatePassword.dialog";

export const mapUpdatePasswordErrorKey = (message?: string) => {
  switch (message) {
    case "INVALID_CURRENT_PASSWORD":
      return "errors.invalidCurrentPassword";
    case "SAME_PASSWORD":
      return "errors.samePassword";
    case "PASSWORD_NOT_SET":
      return "errors.passwordNotSet";
    default:
      return "changeError";
  }
};
