import type { TFunction } from "i18next";
import { updatePasswordDialogLocale } from "./constants";

import { maxLengthPassword, minLengthPassword } from "@time-tracker/shared";

export function getTranslatedError(
  t: TFunction<"translation", undefined>,
  errorMessage: string | undefined,
) {
  if (!errorMessage) return undefined;

  switch (errorMessage) {
    case "password.error.minLength":
      return t(`${updatePasswordDialogLocale}.passwordInput.errors.minLength`, {
        count: minLengthPassword,
      });
    case "password.error.maxLength":
      return t(`${updatePasswordDialogLocale}.passwordInput.errors.maxLength`, {
        count: maxLengthPassword,
      });
    case "password.error.noLetter":
      return t(`${updatePasswordDialogLocale}.passwordInput.errors.noLetter`);
    case "password.error.noDigit":
      return t(`${updatePasswordDialogLocale}.passwordInput.errors.noDigit`);
    case "passwords.mismatch":
      return t(
        `${updatePasswordDialogLocale}.repeatPasswordInput.errors.mismatch`,
      );
    case "repeatPassword.error.required":
      return t(
        `${updatePasswordDialogLocale}.repeatPasswordInput.errors.required`,
      );
    case "currentPassword.error.required":
      return t(
        `${updatePasswordDialogLocale}.currentPasswordInput.errors.required`,
      );
    default:
      return undefined;
  }
}
