import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confirmEmailVerificationSchema,
  startEmailVerificationSchema,
} from "@to-do-list/shared";
import { useCallback, useEffect, useState } from "react";
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
import { useEmailVerification } from "../../useEmailVerification";
import { EmailVerificationResendSlot } from "../EmailVerificationResendSlot";

const baseLocale = "features.emailVerification";

type EmailFormValues = { email: string };

export function SignUpEmailStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goHome = useCallback(() => navigate({ to: "/" }), [navigate]);

  const ev = useEmailVerification({ enabled: true, onVerified: goHome });

  const [code, setCode] = useState<string[]>([]);

  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(startEmailVerificationSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (ev.step === "email") {
      setCode([]);
    }
  }, [ev.step]);

  useEffect(() => {
    setCode([]);
  }, [ev.codeResetKey]);

  const handleStart = useCallback(async () => {
    const valid = await trigger("email");
    if (!valid) return;
    ev.start(getValues("email").trim());
  }, [ev, getValues, trigger]);

  const handleConfirm = useCallback(() => {
    const parsed = confirmEmailVerificationSchema.safeParse({
      code: code.join(""),
    });
    if (!parsed.success) return;
    ev.confirm(parsed.data.code);
  }, [code, ev]);

  const handleCancel = useCallback(() => {
    reset({ email: ev.pendingEmail });
    ev.cancel();
  }, [ev, reset]);

  const handleSkip = useCallback(() => {
    if (ev.step === "code") {
      ev.cancel(goHome);
      return;
    }
    goHome();
  }, [ev, goHome]);

  const getEmailErrorMessage = (message?: string) => {
    if (!message) return undefined;
    if (message === "email is required" || message === "email is invalid") {
      return t(`${baseLocale}.errors.emailInvalid`);
    }
    return message;
  };

  const renderContent = () => {
    if (ev.isStatusLoading) {
      return (
        <Stack.VStack align="stretch" gap={4}>
          <Skeleton height="5" />
          <Skeleton height="10" />
        </Stack.VStack>
      );
    }

    if (ev.step === "email") {
      return (
        <>
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
          <ButtonGroup justify="space-between">
            <Button variant="outline" onClick={handleSkip}>
              {t(`${baseLocale}.skipButton`)}
            </Button>
            <Button onClick={handleStart} loading={ev.isStartPending}>
              {t(`${baseLocale}.sendCodeButton`)}
            </Button>
          </ButtonGroup>
        </>
      );
    }

    return (
      <>
        <Text color="fg.muted" textStyle="sm">
          {ev.isExpired
            ? t(`${baseLocale}.expiredDescription`)
            : t(`${baseLocale}.enterCodeDescription`, {
                email: ev.pendingEmail,
              })}
        </Text>

        <Stack.VStack gap="1rem">
          <PinInput.Root
            count={6}
            size="md"
            disabled={ev.isExpired}
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

          <EmailVerificationResendSlot ev={ev} t={t} />
        </Stack.VStack>

        <ButtonGroup justify="space-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            loading={ev.isCancelPending}
            disabled={ev.isCancelPending}
          >
            {t(`${baseLocale}.cancelButton`)}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={ev.isConfirmPending}
            disabled={ev.isExpired || code.join("").length !== 6}
          >
            {t(`${baseLocale}.verifyButton`)}
          </Button>
        </ButtonGroup>
      </>
    );
  };

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
          {t(`${baseLocale}.registrationTitle`)}
        </Text>
        <Text color="fg.muted" textStyle="sm">
          {t(`${baseLocale}.registrationDescription`)}
        </Text>
        {renderContent()}
      </Stack.VStack>
    </Box>
  );
}
