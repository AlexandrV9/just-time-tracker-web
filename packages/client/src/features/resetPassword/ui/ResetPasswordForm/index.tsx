import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  passwordSchema,
  startPasswordResetSchema,
  verifyPasswordResetSchema,
} from "@to-do-list/shared";
import type { TFunction } from "i18next";
import { useCallback, useEffect, useState } from "react";
import z from "zod";
import { useTranslation } from "~/shared/hooks";
import {
  Box,
  Button,
  ButtonGroup,
  Field,
  Group,
  Input,
  PinInput,
  Skeleton,
  Span,
  Stack,
  Text,
  useForm,
} from "~/shared/ui";
import { useResetPassword } from "../../useResetPassword";

const baseLocale = "features.resetPassword";
const signUpLocale = "features.auth.signUpForm";

type EmailFormValues = { email: string };

const passwordFormSchema = z
  .object({
    newPassword: passwordSchema,
    repeatPassword: z.string().min(1, "repeatPassword.error.required"),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

type ResetPasswordFormProps = {
  recoveryEmail?: string;
  onRecoveryEmailChange: (email: string | undefined) => void;
};

export function ResetPasswordForm({
  recoveryEmail,
  onRecoveryEmailChange,
}: ResetPasswordFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToSignIn = useCallback(() => navigate({ to: "/signin" }), [navigate]);

  const resetPassword = useResetPassword({
    recoveryEmail,
    onRecoveryEmailChange,
    onDone: goToSignIn,
  });

  const [code, setCode] = useState<string[]>([]);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(startPasswordResetSchema),
    mode: "onBlur",
    defaultValues: { email: recoveryEmail ?? "" },
  });

  useEffect(() => {
    if (recoveryEmail) {
      emailForm.reset({ email: recoveryEmail });
    }
  }, [recoveryEmail, emailForm]);

  useEffect(() => {
    if (resetPassword.step === "email" && resetPassword.email) {
      emailForm.reset({ email: resetPassword.email });
    }
  }, [resetPassword.step, resetPassword.email, emailForm]);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    mode: "onBlur",
    defaultValues: { newPassword: "", repeatPassword: "" },
  });

  useEffect(() => {
    setCode([]);
  }, [resetPassword.codeResetKey]);

  const handleStart = useCallback(async () => {
    const valid = await emailForm.trigger("email");
    if (!valid) return;
    resetPassword.start(emailForm.getValues("email").trim());
  }, [emailForm, resetPassword]);

  const handleVerify = useCallback(() => {
    const parsed = verifyPasswordResetSchema.safeParse({
      email: resetPassword.email,
      code: code.join(""),
    });
    if (!parsed.success) return;
    resetPassword.verify(parsed.data.code);
  }, [code, resetPassword]);

  const handleConfirm = passwordForm.handleSubmit((data) => {
    resetPassword.confirm(data.newPassword);
  });

  const getEmailErrorMessage = (message?: string) => {
    if (!message) return undefined;
    if (message === "email is required" || message === "email is invalid") {
      return t(`${baseLocale}.errors.emailInvalid`);
    }
    return message;
  };

  const renderEmailStep = () => (
    <>
      <Text color="fg.muted" textStyle="sm">
        {t(`${baseLocale}.emailDescription`)}
      </Text>
      <Field.Root invalid={!!emailForm.formState.errors.email}>
        <Field.Label>{t(`${baseLocale}.emailLabel`)}</Field.Label>
        <Input
          type="email"
          placeholder={t(`${baseLocale}.emailPlaceholder`)}
          autoComplete="email"
          {...emailForm.register("email")}
        />
        <Field.ErrorText>
          {getEmailErrorMessage(emailForm.formState.errors.email?.message)}
        </Field.ErrorText>
      </Field.Root>
      <ButtonGroup justify="space-between">
        <Button variant="outline" onClick={goToSignIn}>
          {t(`${baseLocale}.backButton`)}
        </Button>
        <Button onClick={handleStart} loading={resetPassword.isStartPending}>
          {t(`${baseLocale}.sendCodeButton`)}
        </Button>
      </ButtonGroup>
    </>
  );

  const renderCodeStep = () => (
    <>
      <Text color="fg.muted" textStyle="sm">
        {resetPassword.isExpired
          ? t(`${baseLocale}.expiredDescription`)
          : t(`${baseLocale}.enterCodeDescription`, {
              email: resetPassword.email,
            })}
      </Text>

      <Stack.VStack gap="1rem">
        <PinInput.Root
          count={6}
          size="md"
          disabled={resetPassword.isExpired}
          value={Array.from({ length: 6 }, (_, i) => code[i] ?? "")}
          onValueChange={(details) => setCode(details.value)}
          otp
        >
          <PinInput.HiddenInput />
          <PinInput.Control alignItems="center" justifyContent="center">
            <Group attached>
              <PinInput.Input index={0} />
              <PinInput.Input index={1} />
              <PinInput.Input index={2} />
            </Group>
            <Span color="fg.subtle">–</Span>
            <Group attached>
              <PinInput.Input index={3} />
              <PinInput.Input index={4} />
              <PinInput.Input index={5} />
            </Group>
          </PinInput.Control>
        </PinInput.Root>

        {!resetPassword.isExpired && resetPassword.resendSecondsLeft > 0 ? (
          <Text color="fg.muted" textStyle="sm">
            {t(`${baseLocale}.resendIn`, {
              seconds: resetPassword.resendSecondsLeft,
            })}
          </Text>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetPassword.resend}
            disabled={
              !resetPassword.canResend || resetPassword.isResendPending
            }
            loading={resetPassword.isResendPending}
          >
            {t(`${baseLocale}.resendButton`)}
          </Button>
        )}
      </Stack.VStack>

      <ButtonGroup justify="space-between">
        <Button variant="outline" onClick={resetPassword.backToEmail}>
          {t(`${baseLocale}.backButton`)}
        </Button>
        <Button
          onClick={handleVerify}
          loading={resetPassword.isVerifyPending}
          disabled={
            resetPassword.isExpired || code.join("").length !== 6
          }
        >
          {t(`${baseLocale}.verifyButton`)}
        </Button>
      </ButtonGroup>
    </>
  );

  const renderPasswordStep = () => (
    <Box as="form" onSubmit={handleConfirm}>
      <Stack.VStack align="stretch" gap={4}>
        <Text color="fg.muted" textStyle="sm">
          {t(`${baseLocale}.newPasswordDescription`)}
        </Text>

        <Field.Root invalid={!!passwordForm.formState.errors.newPassword}>
          <Field.Label>{t(`${baseLocale}.newPasswordLabel`)}</Field.Label>
          <Input.Password
            autoComplete="new-password"
            paddingRight="52px !important"
            placeholder={t(`${baseLocale}.newPasswordPlaceholder`)}
            {...passwordForm.register("newPassword")}
          />
          <Field.ErrorText>
            {getPasswordError(
              t,
              passwordForm.formState.errors.newPassword?.message,
            )}
          </Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!passwordForm.formState.errors.repeatPassword}>
          <Field.Label>{t(`${baseLocale}.repeatPasswordLabel`)}</Field.Label>
          <Input.Password
            autoComplete="new-password"
            showVisibilityButton={false}
            placeholder={t(`${baseLocale}.repeatPasswordPlaceholder`)}
            {...passwordForm.register("repeatPassword")}
          />
          <Field.ErrorText>
            {getPasswordError(
              t,
              passwordForm.formState.errors.repeatPassword?.message,
            )}
          </Field.ErrorText>
        </Field.Root>

        <Button type="submit" loading={resetPassword.isConfirmPending}>
          {t(`${baseLocale}.submitButton`)}
        </Button>
      </Stack.VStack>
    </Box>
  );

  return (
    <Box
      padding="1.5rem"
      bg="bg"
      borderRadius="xl"
      width="full"
      minW={0}
      maxW={400}
    >
      <Stack.VStack align="stretch" gap={4}>
        <Text as="h1" textStyle="2xl" fontWeight="semibold">
          {t(`${baseLocale}.title`)}
        </Text>
        {resetPassword.isStatusLoading ? (
          <Stack.VStack align="stretch" gap={4}>
            <Skeleton height="5" />
            <Skeleton height="10" />
          </Stack.VStack>
        ) : (
          <>
            {resetPassword.step === "email" && renderEmailStep()}
            {resetPassword.step === "code" && renderCodeStep()}
            {resetPassword.step === "password" && renderPasswordStep()}
          </>
        )}
      </Stack.VStack>
    </Box>
  );
}

function getPasswordError(
  t: TFunction<"translation", undefined>,
  message?: string,
) {
  if (!message) return undefined;

  switch (message) {
    case "password.error.minLength":
      return t(`${signUpLocale}.passwordInput.errors.minLength`, { count: 8 });
    case "password.error.maxLength":
      return t(`${signUpLocale}.passwordInput.errors.maxLength`, { count: 64 });
    case "password.error.noLetter":
      return t(`${signUpLocale}.passwordInput.errors.noLetter`);
    case "password.error.noDigit":
      return t(`${signUpLocale}.passwordInput.errors.noDigit`);
    case "passwords.mismatch":
      return t(`${signUpLocale}.repeatPasswordInput.errors.mismatch`);
    case "repeatPassword.error.required":
      return t(`${signUpLocale}.repeatPasswordInput.errors.required`);
    default:
      return undefined;
  }
}
