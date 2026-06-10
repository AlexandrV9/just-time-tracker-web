import z from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z
  .string()
  .trim()
  .min(3, "login.error.minLength")
  .max(30, "login.error.maxLength")
  .regex(/^[a-zA-Z0-9_.-]+$/, "login.error.invalidFormat")
  .refine((value) => !EMAIL_PATTERN.test(value), {
    message: "login.error.isEmail",
  });

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(255),
  login: loginSchema,
});

export type UpdateProfileDataDTO = z.infer<typeof updateProfileSchema>;

export const startEmailVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "email is required")
    .max(255)
    .refine((value) => z.email().safeParse(value).success, "email is invalid"),
});

export type StartEmailVerificationDataDTO = z.infer<
  typeof startEmailVerificationSchema
>;

export const confirmEmailVerificationSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "code must be 6 digits")
    .regex(/^\d{6}$/, "code must be 6 digits"),
});

export type ConfirmEmailVerificationDataDTO = z.infer<
  typeof confirmEmailVerificationSchema
>;

export type EmailVerificationStatus = "none" | "pending" | "expired";

export type EmailVerificationStateDTO = {
  status: EmailVerificationStatus;
  email?: string;
  expiresAt?: string;
  resendAvailableAt?: string;
  devCode?: string;
};

export type ConfirmEmailVerificationResultDTO =
  | { status: "success"; user: ProfileUserDTO }
  | { status: "expired" };

export const profileUserSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  login: z.string(),
  email: z.string().nullable(),
  avatar: z.string().nullable(),
});

export type ProfileUserDTO = z.infer<typeof profileUserSchema>;

export const minLengthPassword = 8;
export const maxLengthPassword = 64;

export const passwordSchema = z
  .string()
  .min(minLengthPassword, "password.error.minLength")
  .max(maxLengthPassword, "password.error.maxLength")
  .refine((val) => /[a-zA-Z]/.test(val), "password.error.noLetter")
  .refine((val) => /\d/.test(val), "password.error.noDigit");

export const setPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export type SetPasswordDataDTO = z.infer<typeof setPasswordSchema>;

const emailField = z
  .string()
  .trim()
  .min(1, "email is required")
  .max(255)
  .refine((value) => z.email().safeParse(value).success, "email is invalid");

const codeField = z
  .string()
  .trim()
  .length(6, "code must be 6 digits")
  .regex(/^\d{6}$/, "code must be 6 digits");

export const startPasswordResetSchema = z.object({
  email: emailField,
});

export type StartPasswordResetDataDTO = z.infer<
  typeof startPasswordResetSchema
>;

export const verifyPasswordResetSchema = z.object({
  email: emailField,
  code: codeField,
});

export type VerifyPasswordResetDataDTO = z.infer<
  typeof verifyPasswordResetSchema
>;

export const confirmPasswordResetSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: passwordSchema,
});

export type ConfirmPasswordResetDataDTO = z.infer<
  typeof confirmPasswordResetSchema
>;

export type PasswordResetStateDTO = {
  status: "pending";
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
  devCode?: string;
};

export type VerifyPasswordResetResultDTO =
  | { status: "verified"; resetToken: string }
  | { status: "expired" };

export type ConfirmPasswordResetResultDTO =
  | { status: "success" }
  | { status: "expired" };
