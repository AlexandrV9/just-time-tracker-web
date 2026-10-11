import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import {
  mapUpdatePasswordErrorKey,
  updatePasswordDialogLocale,
  updatePasswordFormSchema,
} from "./constants";
import { getTranslatedError } from "./utils";
import type { UseDialogReturn } from "@ark-ui/react";

type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;

const defaultValues: UpdatePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  repeatPassword: "",
};

type UpdatePasswordDialogProps = {
  dialog: UseDialogReturn;
};

export function UpdatePasswordDialog({ dialog }: UpdatePasswordDialogProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordFormSchema),
    mode: "all",
    defaultValues,
  });

  useEffect(() => {
    if (!dialog.open) return;
    reset(defaultValues);
  }, [dialog.open, reset]);

  const { mutate: updatePassword, isPending } = useMutation({
    mutationFn: userApiService.updatePassword,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(
          t(
            `${updatePasswordDialogLocale}.${mapUpdatePasswordErrorKey(response.message)}`,
          ),
        );
        return;
      }
      toast.success(t(`${updatePasswordDialogLocale}.changeSuccess`));
      dialog.setOpen(false);
    },
    onError: () => {
      toast.error(t(`${updatePasswordDialogLocale}.changeError`));
    },
  });

  const submitHandler = handleSubmit((data) => {
    updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  });

  const handleCancel = () => {
    dialog.setOpen(false);
  };

  return (
    <Dialog.Root
      size="md"
      lazyMount
      open={dialog.open}
      onOpenChange={(details) => dialog.setOpen(details.open)}
      initialFocusEl={() => null}
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
                {t(`${updatePasswordDialogLocale}.changeTitle`)}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack gap={4} align="stretch">
                <Text fontSize="sm" color="fg.muted">
                  {t(`${updatePasswordDialogLocale}.changeDescription`)}
                </Text>

                <Field.Root invalid={!!errors.currentPassword}>
                  <Field.Label color="fg">
                    {t(
                      `${updatePasswordDialogLocale}.currentPasswordInput.label`,
                    )}
                  </Field.Label>
                  <Input.Password
                    color="fg"
                    truncate
                    autoComplete="current-password"
                    paddingRight="52px !important"
                    placeholder={t(
                      `${updatePasswordDialogLocale}.currentPasswordInput.placeholder`,
                    )}
                    {...register("currentPassword")}
                  />
                  <Field.ErrorText color="fg.error">
                    {getTranslatedError(t, errors.currentPassword?.message)}
                  </Field.ErrorText>
                </Field.Root>

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
                onClick={handleCancel}
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
