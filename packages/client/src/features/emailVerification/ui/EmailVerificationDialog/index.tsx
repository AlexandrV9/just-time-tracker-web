import type { useDialog } from "@ark-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confirmEmailVerificationSchema,
  startEmailVerificationSchema,
} from "@to-do-list/shared";
import { useCallback, useEffect, useState } from "react";
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
import { EmailVerificationResendSlot } from "../EmailVerificationResendSlot";

const baseLocale = "features.emailVerification";

type EmailFormValues = { email: string };

type EmailVerificationDialogProps = {
  dialog: ReturnType<typeof useDialog>;
  initialEmail?: string;
  onVerified?: () => void;
};

export function EmailVerificationDialog({
  dialog,
  initialEmail = "",
  onVerified,
}: EmailVerificationDialogProps) {
  const { t } = useTranslation();

  const ev = useEmailVerification({
    enabled: dialog.open,
    onVerified: () => {
      dialog.setOpen(false);
      onVerified?.();
    },
  });

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
    defaultValues: { email: initialEmail },
  });

  useEffect(() => {
    reset({ email: initialEmail });
  }, [initialEmail, reset]);

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

  const getEmailErrorMessage = (message?: string) => {
    if (!message) return undefined;
    if (message === "email is required" || message === "email is invalid") {
      return t(`${baseLocale}.errors.emailInvalid`);
    }
    return message;
  };

  const renderBody = () => {
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
      </>
    );
  };

  const renderFooter = () => {
    if (ev.isStatusLoading) return null;

    if (ev.step === "email") {
      return (
        <ButtonGroup>
          <Button
            variant="outline"
            onClick={() => dialog.setOpen(false)}
            disabled={ev.isStartPending}
          >
            {t(`${baseLocale}.cancelButton`)}
          </Button>
          <Button onClick={handleStart} loading={ev.isStartPending}>
            {t(`${baseLocale}.sendCodeButton`)}
          </Button>
        </ButtonGroup>
      );
    }

    return (
      <ButtonGroup>
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
    );
  };

  return (
    <Dialog.RootProvider size="md" lazyMount value={dialog}>
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
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
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
    </Dialog.RootProvider>
  );
}
