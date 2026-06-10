import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  maxLengthPassword,
  minLengthPassword,
  passwordSchema,
} from "@to-do-list/shared";
import type { TFunction } from "i18next";
import { useEffect } from "react";
import z from "zod";
import { userApiService } from "~/shared/api/services";
import { useTranslation } from "~/shared/hooks";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  Text,
  toast,
  useForm,
} from "~/shared/ui";

const baseLocale = "pages.settings.security.setPasswordDialog";
const signUpLocale = "features.auth.signUpForm";

const setPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    repeatPassword: z.string().min(1, "repeatPassword.error.required"),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: "passwords.mismatch",
    path: ["repeatPassword"],
  });

type SetPasswordFormValues = z.infer<typeof setPasswordFormSchema>;

type SetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function SetPasswordDialog({
  open,
  onOpenChange,
  onSuccess,
}: SetPasswordDialogProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordFormSchema),
    mode: "onBlur",
    defaultValues: { newPassword: "", repeatPassword: "" },
  });

  useEffect(() => {
    if (!open) {
      reset({ newPassword: "", repeatPassword: "" });
      return;
    }
    setFocus("newPassword");
  }, [open, reset, setFocus]);

  const { mutate: setPassword, isPending } = useMutation({
    mutationFn: userApiService.setPassword,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(t(`${baseLocale}.error`));
        return;
      }
      toast.success(t(`${baseLocale}.success`));
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error(t(`${baseLocale}.error`));
    },
  });

  const submitHandler = handleSubmit((data) => {
    setPassword({ newPassword: data.newPassword });
  });

  return (
    <Dialog.Root
      size="md"
      lazyMount
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            as="form"
            maxW="md"
            w="full"
            mx={4}
            borderRadius="xl"
            onSubmit={submitHandler}
          >
            <Dialog.Header>
              <Dialog.Title fontSize="xl">{t(`${baseLocale}.title`)}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack gap={4} align="stretch">
                <Text fontSize="sm" color="fg.muted">
                  {t(`${baseLocale}.description`)}
                </Text>

                <Field.Root invalid={!!errors.newPassword}>
                  <Field.Label color="fg">
                    {t(`${signUpLocale}.passwordInput.label`)}
                  </Field.Label>
                  <Input.Password
                    color="fg"
                    truncate
                    autoComplete="new-password"
                    paddingRight="52px !important"
                    placeholder={t(`${signUpLocale}.passwordInput.placeholder`)}
                    {...register("newPassword")}
                  />
                  <Field.ErrorText color="fg.error">
                    {getTranslatedError(t, errors.newPassword?.message)}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.repeatPassword}>
                  <Field.Label color="fg">
                    {t(`${signUpLocale}.repeatPasswordInput.label`)}
                  </Field.Label>
                  <Input.Password
                    color="fg"
                    truncate
                    autoComplete="new-password"
                    paddingRight="52px !important"
                    placeholder={t(
                      `${signUpLocale}.repeatPasswordInput.placeholder`,
                    )}
                    {...register("repeatPassword")}
                  />
                  <Field.ErrorText color="fg.error">
                    {getTranslatedError(t, errors.repeatPassword?.message)}
                  </Field.ErrorText>
                </Field.Root>
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
            >
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t(`${baseLocale}.cancelButton`)}
              </Button>
              <Button type="submit" loading={isPending}>
                {t(`${baseLocale}.submitButton`)}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function getTranslatedError(
  t: TFunction<"translation", undefined>,
  errorMessage: string | undefined,
) {
  if (!errorMessage) return undefined;

  switch (errorMessage) {
    case "password.error.minLength":
      return t(`${signUpLocale}.passwordInput.errors.minLength`, {
        count: minLengthPassword,
      });
    case "password.error.maxLength":
      return t(`${signUpLocale}.passwordInput.errors.maxLength`, {
        count: maxLengthPassword,
      });
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
