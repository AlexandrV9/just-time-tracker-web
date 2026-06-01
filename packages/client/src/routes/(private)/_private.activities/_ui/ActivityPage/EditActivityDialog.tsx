import { useDialog } from "@ark-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { ActivityDTO } from "@to-do-list/shared";
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
  TextArea,
} from "~/shared/ui";

export type EditActivityDialogProps = {
  dialog: ReturnType<typeof useDialog>;
  activity: ActivityDTO;
  isSaving: boolean;
  onSave: (data: {
    title: string;
    description: string | null;
  }) => Promise<{ success: boolean; message?: string }>;
};

type EditActivityFormValues = {
  title: string;
  description: string;
};

export function EditActivityDialog({
  dialog,
  activity,
  isSaving,
  onSave,
}: EditActivityDialogProps) {
  const { t } = useTranslation();

  const editActivityFormSchema = useMemo(
    () =>
      z.object({
        title: z
          .string()
          .max(255)
          .refine((s) => s.trim().length > 0, {
            message: t("pages.activities.detail.titleRequiredError"),
          }),
        description: z.string().max(1000),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isValid },
  } = useForm<EditActivityFormValues>({
    mode: "onChange",
    resolver: zodResolver(editActivityFormSchema),
    defaultValues: {
      title: activity.title,
      description: activity.description ?? "",
    },
  });

  useEffect(() => {
    if (!dialog.open) return;

    reset({
      title: activity.title,
      description: activity.description ?? "",
    });

    clearErrors();
    trigger();
  }, [dialog.open, activity, reset, clearErrors, trigger]);

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root");
    const res = await onSave({
      title: data.title.trim(),
      description: data.description.trim() || null,
    });
    if (!res.success && res.message) {
      setError("root", { type: "server", message: res.message });
    }
  });

  const isSaveDisabled = isSaving || !isValid;

  return (
    <Dialog.RootProvider size="md" placement="center" lazyMount value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" w="full" mx={4} borderRadius="xl">
            <Dialog.Header>
              <Dialog.Title fontSize="xl">
                {t("pages.activities.detail.editDialogTitle")}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack.VStack
                gap={4}
                align="stretch"
                as="form"
                id="edit-activity-form"
                onSubmit={onSubmit}
              >
                {errors.root?.message ? (
                  <Text textStyle="sm" color="red.fg">
                    {errors.root.message}
                  </Text>
                ) : null}
                <Field.Root invalid={!!errors.title}>
                  <Field.Label>
                    {t("widgets.activityList.createDialog.nameLabel")}
                  </Field.Label>
                  <Input
                    placeholder={t("pages.activities.detail.titlePlaceholder")}
                    {...register("title")}
                  />
                  {errors.title?.message ? (
                    <Field.ErrorText>{errors.title.message}</Field.ErrorText>
                  ) : null}
                </Field.Root>
                <Field.Root invalid={!!errors.description}>
                  <Field.Label>
                    {t("widgets.activityList.createDialog.descriptionLabel")}
                  </Field.Label>
                  <TextArea
                    placeholder={t(
                      "pages.activities.detail.descriptionPlaceholder",
                    )}
                    {...register("description")}
                  />
                  {errors.description?.message ? (
                    <Field.ErrorText>
                      {errors.description.message}
                    </Field.ErrorText>
                  ) : null}
                </Field.Root>
              </Stack.VStack>
            </Dialog.Body>
            <Dialog.Footer
              borderTop="1px solid"
              borderColor="border.emphasized"
              p="1rem"
              display="flex"
              gap={3}
              justifyContent="flex-end"
            >
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" disabled={isSaving} type="button">
                  {t("pages.activities.detail.cancelEditButton")}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                type="submit"
                form="edit-activity-form"
                disabled={isSaveDisabled}
                loading={isSaving}
              >
                {t("pages.activities.detail.saveButton")}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="2xl" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
