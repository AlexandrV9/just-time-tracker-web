import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import z from "zod";
import {
  setPasswordFormSchema,
  updatePasswordDialogLocale,
} from "~/features/updatePassword/UpdatePasswordDialog/constants";
import { getTranslatedError } from "~/features/updatePassword/UpdatePasswordDialog/utils";
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
        toast.error(t(`${updatePasswordDialogLocale}.error`));
        return;
      }
      toast.success(t(`${updatePasswordDialogLocale}.success`));
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error(t(`${updatePasswordDialogLocale}.error`));
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
              <Dialog.Title fontSize="xl">
                {t(`${updatePasswordDialogLocale}.title`)}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack gap={4} align="stretch">
                <Text fontSize="sm" color="fg.muted">
                  {t(`${updatePasswordDialogLocale}.unlinkDescription`)}
                </Text>

                <Field.Root invalid={!!errors.newPassword}>
                  <Field.Label color="fg">
                    {t(`${updatePasswordDialogLocale}.passwordInput.label`)}
                  </Field.Label>
                  <Input.Password
                    color="fg"
                    truncate
                    autoComplete="new-password"
                    paddingRight="52px !important"
                    placeholder={t(
                      `${updatePasswordDialogLocale}.passwordInput.placeholder`,
                    )}
                    {...register("newPassword")}
                  />
                  <Field.ErrorText color="fg.error">
                    {getTranslatedError(t, errors.newPassword?.message)}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.repeatPassword}>
                  <Field.Label color="fg">
                    {t(
                      `${updatePasswordDialogLocale}.repeatPasswordInput.label`,
                    )}
                  </Field.Label>
                  <Input.Password
                    color="fg"
                    truncate
                    showVisibilityButton={false}
                    autoComplete="new-password"
                    placeholder={t(
                      `${updatePasswordDialogLocale}.repeatPasswordInput.placeholder`,
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
                {t(`${updatePasswordDialogLocale}.cancelButton`)}
              </Button>
              <Button type="submit" loading={isPending}>
                {t(`${updatePasswordDialogLocale}.submitButton`)}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
