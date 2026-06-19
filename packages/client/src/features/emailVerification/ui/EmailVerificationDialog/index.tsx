import type { UseDialogReturn } from "@ark-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confirmEmailVerificationSchema,
} from "@time-tracker/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  Button,
  ButtonGroup,
  CloseButton,
  Dialog,
  Field,
  Group,
  Input,
  PinInput,
  Portal,
  Skeleton,
  Span,
  Stack,
  Text,
  useForm,
} from "~/shared/ui";
import { useEmailVerification } from "../../useEmailVerification";
import {
  createEmailVerificationFormSchema,
  normalizeEmail,
  type EmailVerificationFormValues,
} from "../../useEmailVerification/constants";
import { EmailVerificationResendButton } from "../EmailVerificationResendButton";

const baseLocale = "features.emailVerification";

type EmailVerificationDialogProps = {
  dialog: UseDialogReturn;
  initialEmail?: string;
  currentEmail?: string;
  onVerified?: () => void;
};

export function EmailVerificationDialog({
  dialog,
  initialEmail = "",
  currentEmail = "",
  onVerified,
}: EmailVerificationDialogProps) {
  const { t } = useTranslation();

  const emailVerification = useEmailVerification({
    enabled: dialog.open,
    onVerified: () => {
      dialog.setOpen(false);
      onVerified?.();
    },
  });

  const [code, setCode] = useState<string[]>([]);

  const emailFormSchema = useMemo(
    () => createEmailVerificationFormSchema(currentEmail),
    [currentEmail],
  );

  const {
    register,
    trigger,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmailVerificationFormValues>({
    resolver: zodResolver(emailFormSchema),
    mode: "onBlur",
    defaultValues: { email: initialEmail },
  });

  useEffect(() => {
    if (!dialog.open) {
      reset({ email: initialEmail });
      setCode([]);
      return;
    }

    if (emailVerification.isStatusLoading) return;

    if (emailVerification.step === "email" && emailVerification.pendingEmail) {
      reset({ email: emailVerification.pendingEmail });
      return;
    }

    reset({ email: initialEmail });
  }, [
    dialog.open,
    emailVerification.isStatusLoading,
    emailVerification.pendingEmail,
    emailVerification.step,
    initialEmail,
    reset,
  ]);

  useEffect(() => {
    if (emailVerification.step === "email") {
      setCode([]);
    }
  }, [emailVerification.step]);

  useEffect(() => {
    setCode([]);
  }, [emailVerification.codeResetKey]);

  const emailValue = watch("email");
  const isSendDisabled =
    normalizeEmail(currentEmail).length > 0 &&
    normalizeEmail(emailValue) === normalizeEmail(currentEmail);

  const handleStart = useCallback(async () => {
    const valid = await trigger("email");
    if (!valid) return;
    emailVerification.start(getValues("email").trim());
  }, [emailVerification, getValues, trigger]);

  const handleConfirm = useCallback(() => {
    const parsed = confirmEmailVerificationSchema.safeParse({
      code: code.join(""),
    });

    if (!parsed.success) return;

    emailVerification.confirm(parsed.data.code);
  }, [code, emailVerification]);

  const handleBackToEmail = useCallback(() => {
    reset({ email: emailVerification.pendingEmail || getValues("email") });
    emailVerification.backToEmail();
  }, [emailVerification, getValues, reset]);

  const isCloseLocked =
    !emailVerification.isDailyLimitReached &&
    (emailVerification.step === "code" || emailVerification.isStartPending);

  const resetForm = useCallback(() => {
    reset({ email: initialEmail });
    setCode([]);
  }, [initialEmail, reset]);

  const handleCloseFromEmailStep = useCallback(() => {
    emailVerification.cancel(() => {
      resetForm();
      dialog.setOpen(false);
    });
  }, [dialog, emailVerification, resetForm]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isCloseLocked) return;

      if (!open && emailVerification.step === "email") {
        handleCloseFromEmailStep();
        return;
      }

      dialog.setOpen(open);
    },
    [dialog, emailVerification.step, handleCloseFromEmailStep, isCloseLocked],
  );

  const getEmailErrorMessage = (message?: string) => {
    if (!message) return undefined;
    if (message === "email is required" || message === "email is invalid") {
      return t(`${baseLocale}.errors.emailInvalid`);
    }
    if (message === "email.sameAsCurrent") {
      return t(`${baseLocale}.errors.sameEmail`);
    }
    return message;
  };

  const renderBody = () => {
    if (emailVerification.isStatusLoading) {
      return (
        <Stack.VStack align="stretch" gap={4}>
          <Skeleton height="5" />
          <Skeleton height="10" />
        </Stack.VStack>
      );
    }

    if (emailVerification.step === "email") {
      return (
        <>
          <Text color="fg.muted" textStyle="sm">
            {t(`${baseLocale}.dialogDescription`)}
          </Text>
          <Field.Root invalid={!!errors.email}>
            <Field.Label>{t(`${baseLocale}.emailLabel`)}</Field.Label>
            <Input
              type="email"
              placeholder={t(`${baseLocale}.emailPlaceholder`)}
              autoComplete="off"
              {...register("email")}
            />
            <Field.ErrorText>
              {getEmailErrorMessage(errors.email?.message)}
            </Field.ErrorText>
          </Field.Root>
        </>
      );
    }

    return (
      <>
        <Text color="fg.muted" textStyle="sm">
          {emailVerification.isExpired
            ? t(`${baseLocale}.expiredDescription`)
            : t(`${baseLocale}.enterCodeDescription`, {
                email: emailVerification.pendingEmail,
              })}
        </Text>

        <Stack.VStack gap="1rem">
          <PinInput.Root
            count={6}
            size="md"
            disabled={emailVerification.isExpired}
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

          <EmailVerificationResendButton {...emailVerification} />
        </Stack.VStack>
      </>
    );
  };

  const renderFooter = () => {
    if (emailVerification.isStatusLoading) return null;

    if (emailVerification.step === "email") {
      return (
        <ButtonGroup>
          <Button
            variant="outline"
            onClick={handleCloseFromEmailStep}
            disabled={
              emailVerification.isStartPending ||
              emailVerification.isCancelPending
            }
            loading={emailVerification.isCancelPending}
          >
            {t(`${baseLocale}.cancelButton`)}
          </Button>
          <Button
            onClick={handleStart}
            loading={emailVerification.isStartPending}
            disabled={isSendDisabled}
          >
            {t(`${baseLocale}.sendCodeButton`)}
          </Button>
        </ButtonGroup>
      );
    }

    return (
      <ButtonGroup>
        <Button
          variant="outline"
          onClick={handleBackToEmail}
          loading={emailVerification.isCancelPending}
          disabled={emailVerification.isCancelPending}
        >
          {t(`${baseLocale}.cancelButton`)}
        </Button>
        <Button
          onClick={handleConfirm}
          loading={emailVerification.isConfirmPending}
          disabled={emailVerification.isExpired || code.join("").length !== 6}
        >
          {t(`${baseLocale}.verifyButton`)}
        </Button>
      </ButtonGroup>
    );
  };

  return (
    <Dialog.Root
      size="md"
      lazyMount
      open={dialog.open}
      onOpenChange={(details) => handleOpenChange(details.open)}
      closeOnEscape={!isCloseLocked}
      closeOnInteractOutside={!isCloseLocked}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW="md"
            w="full"
            mx={4}
            borderRadius="xl"
            display="flex"
            flexDirection="column"
            minH="320px"
            maxH="min(85dvh, 560px)"
            overflow="hidden"
          >
            <Dialog.Header>
              <Dialog.Title>{t(`${baseLocale}.dialogTitle`)}</Dialog.Title>
            </Dialog.Header>
            {!isCloseLocked && (
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            )}
            <Dialog.Body>
              <Stack.VStack align="stretch" gap={4}>
                {renderBody()}
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              {renderFooter()}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
